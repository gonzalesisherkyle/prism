import { Router } from "express";

import { getReview, listReviews } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const reviewRouter = Router();

reviewRouter.use(requireAuth);
reviewRouter.get("/", listReviews);
reviewRouter.get("/:id", getReview);

export default reviewRouter;
