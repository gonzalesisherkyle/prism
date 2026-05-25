import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import type { ReviewComment } from "../types/review.js";

const githubApiBaseUrl = "https://api.github.com";
const githubApiVersion = "2022-11-28";

export interface GitHubRepository {
  id: number;
  fullName: string;
}

export interface GitHubWebhook {
  id: number;
}

export interface GitHubPullRequestFile {
  filename: string;
  patch?: string;
}

export interface GitHubReview {
  id: number;
}

export interface PostReviewOptions {
  body?: string;
  commitId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function apiRepositoryPath(repoFullName: string): string {
  const parts = repoFullName.trim().split("/");

  if (
    parts.length !== 2 ||
    parts.some((part) => part.length === 0 || /\s/.test(part))
  ) {
    throw new HttpError(400, "repoFullName must use the format owner/repository.");
  }

  return parts.map((part) => encodeURIComponent(part)).join("/");
}

function requestHeaders(accessToken: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": "Prism-Code-Review",
    "X-GitHub-Api-Version": githubApiVersion,
  };
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return undefined;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return undefined;
  }
}

function githubMessage(payload: unknown): string | undefined {
  return isRecord(payload) && typeof payload.message === "string"
    ? payload.message
    : undefined;
}

function handleGitHubFailure(response: Response, payload: unknown, operationName: string): never {
  if (response.status === 401 || response.status === 403) {
    throw new HttpError(
      403,
      `GitHub denied ${operationName}. Reauthorize Prism with repository permissions.`,
    );
  }

  if (response.status === 404) {
    throw new HttpError(404, "The GitHub repository was not found or is not accessible.");
  }

  if (response.status === 422) {
    throw new HttpError(
      operationName === "repository webhook registration" ? 409 : 502,
      githubMessage(payload) ?? `GitHub rejected ${operationName}.`,
    );
  }

  throw new HttpError(502, `The GitHub API request failed during ${operationName}.`);
}

async function githubRequest(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<{ response: Response; payload: unknown }> {
  let response: Response;

  try {
    response = await fetch(`${githubApiBaseUrl}${path}`, {
      ...init,
      headers: requestHeaders(accessToken),
    });
  } catch {
    throw new HttpError(502, "Unable to reach GitHub.");
  }

  return {
    response,
    payload: await parseResponseBody(response),
  };
}

export async function getGitHubRepository(
  repoFullName: string,
  accessToken: string,
): Promise<GitHubRepository> {
  const repositoryPath = apiRepositoryPath(repoFullName);
  const { response, payload } = await githubRequest(
    `/repos/${repositoryPath}`,
    accessToken,
  );

  if (!response.ok) {
    handleGitHubFailure(response, payload, "repository access verification");
  }

  if (
    !isRecord(payload) ||
    typeof payload.id !== "number" ||
    typeof payload.full_name !== "string"
  ) {
    throw new HttpError(502, "GitHub returned an invalid repository response.");
  }

  return {
    id: payload.id,
    fullName: payload.full_name,
  };
}

export async function createGitHubWebhook(
  repoFullName: string,
  accessToken: string,
): Promise<GitHubWebhook> {
  const repositoryPath = apiRepositoryPath(repoFullName);
  const webhookUrl = `${env.publicApiUrl}/webhook/github`;
  const { response, payload } = await githubRequest(
    `/repos/${repositoryPath}/hooks`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["pull_request"],
        config: {
          url: webhookUrl,
          content_type: "json",
          insecure_ssl: "0",
          secret: env.githubWebhookSecret,
        },
      }),
    },
  );

  if (!response.ok) {
    handleGitHubFailure(response, payload, "repository webhook registration");
  }

  if (!isRecord(payload) || typeof payload.id !== "number") {
    throw new HttpError(502, "GitHub returned an invalid webhook response.");
  }

  return { id: payload.id };
}

export async function deleteGitHubWebhook(
  repoFullName: string,
  webhookId: number,
  accessToken: string,
): Promise<void> {
  const repositoryPath = apiRepositoryPath(repoFullName);
  const { response, payload } = await githubRequest(
    `/repos/${repositoryPath}/hooks/${webhookId}`,
    accessToken,
    { method: "DELETE" },
  );

  if (!response.ok) {
    handleGitHubFailure(response, payload, "repository webhook removal");
  }
}

function validatePullRequestNumber(prNumber: number): void {
  if (!Number.isInteger(prNumber) || prNumber < 1) {
    throw new HttpError(400, "Pull request number must be a positive integer.");
  }
}

function isPullRequestFile(value: unknown): value is Record<string, unknown> & {
  filename: string;
} {
  return isRecord(value) && typeof value.filename === "string";
}

export async function getPRFiles(
  owner: string,
  repo: string,
  prNumber: number,
  accessToken: string,
): Promise<GitHubPullRequestFile[]> {
  validatePullRequestNumber(prNumber);
  const repositoryPath = apiRepositoryPath(`${owner}/${repo}`);
  const files: GitHubPullRequestFile[] = [];
  let page = 1;

  while (true) {
    const { response, payload } = await githubRequest(
      `/repos/${repositoryPath}/pulls/${prNumber}/files?per_page=100&page=${page}`,
      accessToken,
    );

    if (!response.ok) {
      handleGitHubFailure(response, payload, "pull request file retrieval");
    }

    if (!Array.isArray(payload) || !payload.every(isPullRequestFile)) {
      throw new HttpError(502, "GitHub returned an invalid pull request files response.");
    }

    files.push(
      ...payload.map((file) => ({
        filename: file.filename,
        ...(typeof file.patch === "string" ? { patch: file.patch } : {}),
      })),
    );

    if (payload.length < 100) {
      return files;
    }

    page += 1;
  }
}

export async function postReviewComments(
  owner: string,
  repo: string,
  prNumber: number,
  comments: ReviewComment[],
  accessToken: string,
  options: PostReviewOptions = {},
): Promise<GitHubReview> {
  validatePullRequestNumber(prNumber);
  const repositoryPath = apiRepositoryPath(`${owner}/${repo}`);
  const { response, payload } = await githubRequest(
    `/repos/${repositoryPath}/pulls/${prNumber}/reviews`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        ...(options.commitId ? { commit_id: options.commitId } : {}),
        body: options.body ?? "Automated review from Prism.",
        event: "COMMENT",
        comments: comments.map((comment) => ({
          path: comment.path,
          line: comment.line,
          side: "RIGHT",
          body: `**Prism ${comment.severity.toUpperCase()}**\n\n${comment.body}`,
        })),
      }),
    },
  );

  if (!response.ok) {
    handleGitHubFailure(response, payload, "pull request review publication");
  }

  if (!isRecord(payload) || typeof payload.id !== "number") {
    throw new HttpError(502, "GitHub returned an invalid pull request review response.");
  }

  return { id: payload.id };
}
