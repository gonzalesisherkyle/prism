import { Router } from "express";

import {
  disableReviewSharing,
  enableReviewSharing,
  getReview,
  listReviews,
} from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const reviewRouter = Router();

reviewRouter.use(requireAuth);
reviewRouter.get("/", listReviews);
reviewRouter.post("/:id/share", enableReviewSharing);
reviewRouter.delete("/:id/share", disableReviewSharing);
reviewRouter.get("/:id", getReview);

export default reviewRouter;
