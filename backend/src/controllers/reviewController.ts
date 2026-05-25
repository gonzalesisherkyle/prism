import type { Request, RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

import { HttpError } from "../errors/HttpError.js";
import { RepoModel } from "../models/Repo.js";
import { ReviewModel, type ReviewDocument } from "../models/Review.js";

function authenticatedUserId(request: Request): string {
  if (!request.user) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.user.id;
}

function requestedRepoId(value: unknown): number {
  const repoId = typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(repoId) || repoId <= 0) {
    throw new HttpError(400, "repoId must be a positive integer.");
  }

  return repoId;
}

function serializeReview(review: ReviewDocument) {
  return {
    id: review.id,
    prNumber: review.prNumber,
    prTitle: review.prTitle,
    repoId: review.repoId,
    repoFullName: review.repoFullName,
    score: review.score,
    summary: review.summary,
    comments: review.comments,
    headSha: review.headSha,
    createdAt: review.createdAt,
  };
}

async function assertRepositoryAccess(ownerId: string, repoId: number): Promise<void> {
  const repo = await RepoModel.exists({ ownerId, repoId });

  if (!repo) {
    throw new HttpError(404, "The registered repository was not found.");
  }
}

export const listReviews: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const repoId = requestedRepoId(request.query.repoId);

    await assertRepositoryAccess(ownerId, repoId);

    const reviews = await ReviewModel.find({ repoId }).sort({ createdAt: -1 }).exec();

    response.status(200).json({ reviews: reviews.map(serializeReview) });
  } catch (error) {
    next(error);
  }
};

export const getReview: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const reviewId = request.params.id;

    if (!reviewId || !isValidObjectId(reviewId)) {
      throw new HttpError(400, "Review id is invalid.");
    }

    const review = await ReviewModel.findById(reviewId).exec();

    if (!review) {
      throw new HttpError(404, "The review was not found.");
    }

    await assertRepositoryAccess(ownerId, review.repoId);

    response.status(200).json({ review: serializeReview(review) });
  } catch (error) {
    next(error);
  }
};

