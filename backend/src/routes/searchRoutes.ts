import { Router } from "express";

import { searchReviews } from "../controllers/searchController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const searchRouter = Router();

searchRouter.use(requireAuth);
searchRouter.get("/", searchReviews);

export default searchRouter;
