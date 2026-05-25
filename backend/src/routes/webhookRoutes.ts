import express, { Router } from "express";

import {
  receiveGitHubWebhook,
  verifyGitHubWebhook,
} from "../controllers/webhookController.js";
import { limitRepositoryReviews } from "../middleware/reviewRateLimiter.js";

const webhookRouter = Router();

// Signatures cover the exact bytes GitHub sent, so this endpoint receives a raw Buffer.
webhookRouter.post(
  "/github",
  express.raw({ type: "application/json", limit: "1mb" }),
  verifyGitHubWebhook,
  limitRepositoryReviews,
  receiveGitHubWebhook,
);

export default webhookRouter;
