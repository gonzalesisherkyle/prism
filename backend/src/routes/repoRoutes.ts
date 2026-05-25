import { Router } from "express";

import { listRepositories, registerRepository } from "../controllers/repoController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const repoRouter = Router();

repoRouter.use(requireAuth);
repoRouter.post("/register", registerRepository);
repoRouter.get("/", listRepositories);

export default repoRouter;

