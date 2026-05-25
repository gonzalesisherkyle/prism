import { randomBytes, timingSafeEqual } from "node:crypto";

import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";

const oauthStateCookieName = "prism_oauth_state";
const oauthStateLifetimeMilliseconds = 10 * 60 * 1000;

interface GitHubAccessTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GitHubProfile {
  id: number;
  login: string;
  avatar_url: string;
}

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stateMatches(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export const redirectToGitHub: RequestHandler = (_request, response) => {
  const state = randomBytes(32).toString("hex");

  // The transient state cookie prevents a third party from forging an OAuth callback.
  response.cookie(oauthStateCookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: oauthStateLifetimeMilliseconds,
  });

  const authorizationParameters = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubCallbackUrl,
    scope: "read:user repo",
    state,
  });

  response.redirect(
    `https://github.com/login/oauth/authorize?${authorizationParameters.toString()}`,
  );
};

export const handleGitHubCallback: RequestHandler = async (request, response, next) => {
  try {
    const code = queryString(request.query.code);
    const state = queryString(request.query.state);
    const storedState = queryString(request.cookies[oauthStateCookieName]);
    const authorizationError = queryString(request.query.error);

    if (authorizationError) {
      response.status(400).json({ message: "GitHub authorization was not completed." });
      return;
    }

    if (!code || !state || !storedState || !stateMatches(storedState, state)) {
      response.status(400).json({ message: "Invalid GitHub OAuth callback state." });
      return;
    }

    response.clearCookie(oauthStateCookieName, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
    });

    const accessTokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.githubClientId,
        client_secret: env.githubClientSecret,
        code,
        redirect_uri: env.githubCallbackUrl,
      }),
    });

    const accessTokenPayload =
      (await accessTokenResponse.json()) as GitHubAccessTokenResponse;

    if (!accessTokenResponse.ok || !accessTokenPayload.access_token) {
      console.error("GitHub OAuth token exchange failed.", {
        status: accessTokenResponse.status,
        error: accessTokenPayload.error,
        description: accessTokenPayload.error_description,
      });
      response.status(502).json({ message: "GitHub token exchange failed." });
      return;
    }

    const githubAccessToken = accessTokenPayload.access_token;
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!profileResponse.ok) {
      console.error("GitHub OAuth profile request failed.", {
        status: profileResponse.status,
      });
      response.status(502).json({ message: "GitHub profile request failed." });
      return;
    }

    const githubProfile = (await profileResponse.json()) as GitHubProfile;

    // Update the token at each login so future pull request operations use current permission grants.
    const user = await UserModel.findOneAndUpdate(
      { githubId: String(githubProfile.id) },
      {
        $set: {
          username: githubProfile.login,
          avatarUrl: githubProfile.avatar_url,
          accessToken: githubAccessToken,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    const token = jwt.sign(
      {
        githubId: user.githubId,
        username: user.username,
      },
      env.jwtSecret,
      {
        subject: user.id,
        expiresIn: "7d",
      },
    );

    // Only Prism's short-lived token reaches the UI; the GitHub token remains server-side.
    const frontendCallbackUrl = new URL("/auth/callback", env.frontendUrl);
    frontendCallbackUrl.searchParams.set("token", token);
    response.redirect(frontendCallbackUrl.toString());
  } catch (error) {
    next(error);
  }
};
