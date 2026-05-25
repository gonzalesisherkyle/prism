import type { ReviewQueuePayload } from "../services/reviewQueue.js";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        githubId: string;
        username: string;
      };
      reviewPayload?: ReviewQueuePayload;
    }
  }
}
