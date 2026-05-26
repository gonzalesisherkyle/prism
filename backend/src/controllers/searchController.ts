import type { Request, RequestHandler } from "express";

import { HttpError } from "../errors/HttpError.js";
import { RepoModel } from "../models/Repo.js";
import { ReviewModel } from "../models/Review.js";
import { getQueryEmbedding } from "../services/embeddingService.js";
import { cosineSimilarity } from "../utils/vectorUtils.js";

function authenticatedUserId(request: Request): string {
  if (!request.user) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.user.id;
}

function requestedQuery(value: unknown): string {
  const query = typeof value === "string" ? value.trim() : "";

  if (!query) {
    throw new HttpError(400, "q is required.");
  }

  return query;
}

function optionalRepoId(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const repoId = typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(repoId) || repoId <= 0) {
    throw new HttpError(400, "repoId must be a positive integer.");
  }

  return repoId;
}

async function searchableRepoIds(ownerId: string, repoId?: number): Promise<number[]> {
  if (repoId !== undefined) {
    const registeredRepo = await RepoModel.exists({ ownerId, repoId });

    if (!registeredRepo) {
      throw new HttpError(404, "The registered repository was not found.");
    }

    return [repoId];
  }

  const repos = await RepoModel.find({ ownerId }).select("repoId").lean().exec();

  return repos.map((repo) => repo.repoId);
}

export const searchReviews: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const query = requestedQuery(request.query.q);
    const repoId = optionalRepoId(request.query.repoId);
    const repoIds = await searchableRepoIds(ownerId, repoId);

    if (repoIds.length === 0) {
      response.status(200).json({ results: [] });
      return;
    }

    const queryEmbedding = await getQueryEmbedding(query);
    const reviews = await ReviewModel.find({ repoId: { $in: repoIds } })
      .select("_id prTitle repoFullName score summary summaryEmbedding createdAt")
      .exec();
    const results = reviews
      .map((review) => ({
        _id: review.id,
        prTitle: review.prTitle,
        repoFullName: review.repoFullName,
        score: review.score,
        summary: review.summary,
        createdAt: review.createdAt,
        similarity: cosineSimilarity(queryEmbedding, review.summaryEmbedding),
      }))
      .sort(
        (left, right) =>
          right.similarity - left.similarity ||
          right.createdAt.getTime() - left.createdAt.getTime(),
      )
      .slice(0, 10);

    response.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};
