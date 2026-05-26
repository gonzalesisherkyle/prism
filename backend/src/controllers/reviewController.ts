import { randomBytes } from "node:crypto";

import type { Request, RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

import { env } from "../config/env.js";
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
  const isShareable = review.isShareable ?? false;

  return {
    id: review.id,
    prNumber: review.prNumber,
    prTitle: review.prTitle,
    repoId: review.repoId,
    repoFullName: review.repoFullName,
    score: review.score,
    summary: review.summary,
    prSummary: review.prSummary ?? "",
    isShareable,
    shareUrl:
      isShareable && review.shareToken
        ? `${env.frontendUrl}/share/${review.shareToken}`
        : null,
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

function requestedReviewId(value: unknown): string {
  if (typeof value !== "string" || !isValidObjectId(value)) {
    throw new HttpError(400, "Review id is invalid.");
  }

  return value;
}

async function findAuthorizedReview(ownerId: string, reviewId: string): Promise<ReviewDocument> {
  const review = await ReviewModel.findById(reviewId).exec();

  if (!review) {
    throw new HttpError(404, "The review was not found.");
  }

  await assertRepositoryAccess(ownerId, review.repoId);

  return review;
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
    const reviewId = requestedReviewId(request.params.id);
    const review = await findAuthorizedReview(ownerId, reviewId);

    response.status(200).json({ review: serializeReview(review) });
  } catch (error) {
    next(error);
  }
};

export const enableReviewSharing: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const reviewId = requestedReviewId(request.params.id);
    const review = await findAuthorizedReview(ownerId, reviewId);

    review.shareToken ??= randomBytes(16).toString("hex");
    review.isShareable = true;

    await review.save();

    response.status(200).json({
      shareUrl: `${env.frontendUrl}/share/${review.shareToken}`,
    });
  } catch (error) {
    next(error);
  }
};

export const disableReviewSharing: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const reviewId = requestedReviewId(request.params.id);
    const review = await findAuthorizedReview(ownerId, reviewId);

    review.isShareable = false;
    await review.save();

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getSharedReview: RequestHandler = async (request, response, next) => {
  try {
    const shareToken = request.params.shareToken;

    if (typeof shareToken !== "string" || !/^[0-9a-f]{32}$/i.test(shareToken)) {
      throw new HttpError(404, "The shared review was not found.");
    }

    const review = await ReviewModel.findOne({ shareToken }).exec();

    if (!review) {
      throw new HttpError(404, "The shared review was not found.");
    }

    if (!review.isShareable) {
      throw new HttpError(403, "This review is no longer public.");
    }

    response.status(200).json({
      prTitle: review.prTitle,
      repoFullName: review.repoFullName,
      score: review.score,
      prSummary: review.prSummary ?? "",
      comments: review.comments,
      createdAt: review.createdAt,
      headSha: review.headSha,
    });
  } catch (error) {
    next(error);
  }
};
