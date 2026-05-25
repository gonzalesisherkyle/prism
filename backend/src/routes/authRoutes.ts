import { Router } from "express";

import { handleGitHubCallback, redirectToGitHub } from "../controllers/authController.js";

const authRouter = Router();

authRouter.get("/github", redirectToGitHub);
authRouter.get("/callback", handleGitHubCallback);

export default authRouter;

