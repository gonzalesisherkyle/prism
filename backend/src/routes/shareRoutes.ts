import { Router } from "express";

import { getSharedReview } from "../controllers/reviewController.js";

const shareRouter = Router();

shareRouter.get("/:shareToken", getSharedReview);

export default shareRouter;
