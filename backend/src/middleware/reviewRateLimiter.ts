import type { RequestHandler } from "express";

import { HttpError } from "../errors/HttpError.js";

const reviewWindowMilliseconds = 60 * 60 * 1000;
const maximumReviewsPerWindow = 3;
const requestsByRepository = new Map<number, number[]>();

export const limitRepositoryReviews: RequestHandler = (request, response, next) => {
  const payload = request.reviewPayload;

  if (!payload) {
    next(new HttpError(500, "Review payload was not prepared for rate limiting."));
    return;
  }

  const now = Date.now();
  const cutoff = now - reviewWindowMilliseconds;
  const recentRequests = (requestsByRepository.get(payload.repoId) ?? []).filter(
    (timestamp) => timestamp > cutoff,
  );

  if (recentRequests.length >= maximumReviewsPerWindow) {
    const retryAfterSeconds = Math.ceil(
      (recentRequests[0]! + reviewWindowMilliseconds - now) / 1000,
    );

    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.status(429).json({
      message: "Review limit reached. Prism accepts at most 3 reviews per repository per hour.",
      retryAfterSeconds,
    });
    return;
  }

  recentRequests.push(now);
  requestsByRepository.set(payload.repoId, recentRequests);
  next();
};

