import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";

interface PrismJwtPayload extends JwtPayload {
  sub: string;
  githubId: string;
  username: string;
}

export const requireAuth: RequestHandler = (request, response, next) => {
  const [scheme, token] = request.header("Authorization")?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ message: "A Bearer token is required." });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.githubId !== "string" ||
      typeof decoded.username !== "string"
    ) {
      response.status(401).json({ message: "The authentication token is invalid." });
      return;
    }

    const claims = decoded as PrismJwtPayload;

    // Downstream handlers receive only identity claims, never the GitHub access token.
    request.user = {
      id: claims.sub,
      githubId: claims.githubId,
      username: claims.username,
    };

    next();
  } catch {
    response.status(401).json({ message: "The authentication token is invalid or expired." });
  }
};

