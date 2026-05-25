import type { Request, RequestHandler } from "express";

import { HttpError } from "../errors/HttpError.js";
import { RepoModel, type RepoDocument } from "../models/Repo.js";
import { UserModel } from "../models/User.js";
import {
  createGitHubWebhook,
  deleteGitHubWebhook,
  getGitHubRepository,
} from "../services/githubService.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function authenticatedUserId(request: Request): string {
  if (!request.user) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.user.id;
}

function requestedRepoFullName(body: unknown): string {
  if (!isRecord(body) || typeof body.repoFullName !== "string") {
    throw new HttpError(400, "repoFullName is required.");
  }

  return body.repoFullName.trim();
}

function serializeRepo(repo: RepoDocument) {
  return {
    id: repo.id,
    repoId: repo.repoId,
    fullName: repo.fullName,
    webhookId: repo.webhookId,
    ownerId: repo.ownerId.toString(),
    createdAt: repo.createdAt,
  };
}

export const registerRepository: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const repoFullName = requestedRepoFullName(request.body);
    const user = await UserModel.findById(ownerId).select("+accessToken").exec();

    if (!user) {
      throw new HttpError(401, "The authenticated user no longer exists.");
    }

    // Fetch the repository first to validate access and store GitHub's canonical name and id.
    const githubRepository = await getGitHubRepository(repoFullName, user.accessToken);
    const registeredRepo = await RepoModel.findOne({
      ownerId: user._id,
      repoId: githubRepository.id,
    }).exec();

    if (registeredRepo) {
      throw new HttpError(409, "This repository is already registered for the user.");
    }

    const webhook = await createGitHubWebhook(githubRepository.fullName, user.accessToken);

    try {
      const repo = await RepoModel.create({
        repoId: githubRepository.id,
        fullName: githubRepository.fullName,
        webhookId: webhook.id,
        ownerId: user._id,
      });

      response.status(201).json({ repo: serializeRepo(repo) });
    } catch (error) {
      // Avoid leaving an unmanaged GitHub hook behind if MongoDB persistence fails.
      try {
        await deleteGitHubWebhook(githubRepository.fullName, webhook.id, user.accessToken);
      } catch (cleanupError) {
        console.error("Unable to remove webhook after repository save failure.", cleanupError);
      }

      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const listRepositories: RequestHandler = async (request, response, next) => {
  try {
    const ownerId = authenticatedUserId(request);
    const repos = await RepoModel.find({ ownerId }).sort({ createdAt: -1 }).exec();

    response.status(200).json({ repos: repos.map(serializeRepo) });
  } catch (error) {
    next(error);
  }
};

