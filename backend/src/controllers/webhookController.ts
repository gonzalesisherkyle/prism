import { createHmac, timingSafeEqual } from "node:crypto";

import type { RequestHandler } from "express";

import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import { reviewQueue, type ReviewQueuePayload } from "../services/reviewQueue.js";

interface PullRequestWebhook {
  action: string;
  number: number;
  pull_request: {
    title: string;
    head: {
      sha: string;
    };
  };
  repository: {
    id: number;
    full_name: string;
  };
  sender: {
    login: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasAction(value: unknown): value is { action: string } {
  return isRecord(value) && typeof value.action === "string";
}

function isPullRequestWebhook(value: unknown): value is PullRequestWebhook {
  if (!isRecord(value)) {
    return false;
  }

  const pullRequest = value.pull_request;
  const repository = value.repository;
  const sender = value.sender;

  return (
    typeof value.action === "string" &&
    typeof value.number === "number" &&
    isRecord(pullRequest) &&
    typeof pullRequest.title === "string" &&
    isRecord(pullRequest.head) &&
    typeof pullRequest.head.sha === "string" &&
    isRecord(repository) &&
    typeof repository.id === "number" &&
    typeof repository.full_name === "string" &&
    isRecord(sender) &&
    typeof sender.login === "string"
  );
}

function validSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", env.githubWebhookSecret)
    .update(rawBody)
    .digest("hex")}`;
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  // timingSafeEqual requires equal sized buffers, so reject malformed headers first.
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export const verifyGitHubWebhook: RequestHandler = (request, response, next) => {
  try {
    if (!Buffer.isBuffer(request.body)) {
      throw new HttpError(400, "Webhook payload must be sent as application/json.");
    }

    if (!validSignature(request.body, request.header("X-Hub-Signature-256"))) {
      response.status(401).json({ message: "Invalid webhook signature." });
      return;
    }

    let body: unknown;

    try {
      body = JSON.parse(request.body.toString("utf8")) as unknown;
    } catch {
      throw new HttpError(400, "Webhook payload contains invalid JSON.");
    }

    if (request.header("X-GitHub-Event") !== "pull_request") {
      response.status(202).json({ message: "Webhook event ignored." });
      return;
    }

    if (!hasAction(body)) {
      throw new HttpError(400, "Pull request webhook payload is missing an action.");
    }

    if (body.action !== "opened" && body.action !== "synchronize") {
      response.status(202).json({ message: "Pull request action ignored." });
      return;
    }

    if (!isPullRequestWebhook(body)) {
      throw new HttpError(400, "Pull request webhook payload is incomplete.");
    }

    const reviewPayload: ReviewQueuePayload = {
      repoId: body.repository.id,
      repoFullName: body.repository.full_name,
      prNumber: body.number,
      prTitle: body.pull_request.title,
      headSha: body.pull_request.head.sha,
      senderLogin: body.sender.login,
    };

    request.reviewPayload = reviewPayload;
    next();
  } catch (error) {
    next(error);
  }
};

export const receiveGitHubWebhook: RequestHandler = async (request, response, next) => {
  try {
    if (!request.reviewPayload) {
      throw new HttpError(500, "Review payload was not prepared for processing.");
    }

    await reviewQueue.add(request.reviewPayload);

    response.status(202).json({ message: "Pull request review queued." });
  } catch (error) {
    next(error);
  }
};
