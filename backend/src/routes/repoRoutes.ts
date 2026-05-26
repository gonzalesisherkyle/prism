import { Router } from "express";

import {
  getRepositoryHealth,
  listRepositories,
  registerRepository,
} from "../controllers/repoController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const repoRouter = Router();

repoRouter.use(requireAuth);
repoRouter.post("/register", registerRepository);
repoRouter.get("/", listRepositories);
repoRouter.get("/:repoId/health", getRepositoryHealth);

export default repoRouter;
