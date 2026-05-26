import { HttpError } from "../errors/HttpError.js";
import type { FileReviewResult, ReviewComment, ReviewSeverity } from "../types/review.js";
import type { Hunk } from "../utils/diffParser.js";
import { requestOpenRouter } from "./openRouterClient.js";

const reviewModel = "openai/gpt-oss-120b:free";
const maxCommentsPerFile = 8;
const systemPrompt =
  "You are Prism, a senior engineer reviewing a pull request. Respond ONLY with a valid JSON object in this exact shape: { score: number (1-10), summary: string, comments: [{ path, line, severity: 'critical'|'warning'|'suggestion', body }] }. No markdown, no explanation, just the JSON.\n\n" +
  "Rules: Return at most 8 comments per file. Only flag real issues such as bugs, security vulnerabilities, or missing error handling. Do not nitpick style. Inline comments must target an added line in the supplied patch, using that line's newLineNumber and the exact filename path.";
const summarySystemPrompt =
  "You are Prism, an AI code review assistant. Given a list of changed files and their diffs, write a concise one-paragraph plain English summary of what this pull request does. Focus on intent and impact, not implementation details. Do not mention file names directly. Write for a developer who needs quick context before reviewing.";
const summaryFallback =
  "Prism could not generate a pull request summary for this revision.";

export interface PRSummaryFile {
  filename: string;
  patch: string;
}

interface OpenRouterChatChoice {
  message: {
    content: string;
  };
}

interface OpenRouterChatResponse {
  choices: OpenRouterChatChoice[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSeverity(value: unknown): value is ReviewSeverity {
  return value === "critical" || value === "warning" || value === "suggestion";
}

function isChatResponse(value: unknown): value is OpenRouterChatResponse {
  if (!isRecord(value) || !Array.isArray(value.choices) || value.choices.length === 0) {
    return false;
  }

  const firstChoice = value.choices[0];

  return (
    isRecord(firstChoice) &&
    isRecord(firstChoice.message) &&
    typeof firstChoice.message.content === "string"
  );
}

function stripMarkdownCodeFence(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function validComment(value: unknown, filename: string): value is ReviewComment {
  return (
    isRecord(value) &&
    value.path === filename &&
    Number.isInteger(value.line) &&
    (value.line as number) > 0 &&
    isSeverity(value.severity) &&
    typeof value.body === "string" &&
    value.body.trim().length > 0
  );
}

function parseReviewResult(content: string, filename: string): FileReviewResult {
  let payload: unknown;

  try {
    payload = JSON.parse(stripMarkdownCodeFence(content)) as unknown;
  } catch {
    throw new HttpError(502, "OpenRouter returned review content that was not valid JSON.");
  }

  if (
    !isRecord(payload) ||
    typeof payload.score !== "number" ||
    !Number.isFinite(payload.score) ||
    payload.score < 1 ||
    payload.score > 10 ||
    typeof payload.summary !== "string" ||
    payload.summary.trim().length === 0 ||
    !Array.isArray(payload.comments) ||
    payload.comments.length > maxCommentsPerFile ||
    !payload.comments.every((comment) => validComment(comment, filename))
  ) {
    throw new HttpError(502, "OpenRouter returned an invalid code review shape.");
  }

  return {
    score: payload.score,
    summary: payload.summary.trim(),
    comments: payload.comments,
  };
}

export async function reviewFile(
  filename: string,
  language: string,
  hunks: Hunk[],
): Promise<FileReviewResult> {
  const response = await requestOpenRouter(
    "/chat/completions",
    {
      model: reviewModel,
      temperature: 0.1,
      max_tokens: 2_000,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: JSON.stringify({
            filename,
            language,
            hunks,
          }),
        },
      ],
    },
    "code review request",
  );

  if (!isChatResponse(response)) {
    throw new HttpError(502, "OpenRouter returned an invalid chat completion response.");
  }

  const choice = response.choices[0];

  if (!choice) {
    throw new HttpError(502, "OpenRouter returned an empty chat completion response.");
  }

  return parseReviewResult(choice.message.content, filename);
}

export async function generatePRSummary(files: PRSummaryFile[]): Promise<string> {
  try {
    const response = await requestOpenRouter(
      "/chat/completions",
      {
        model: reviewModel,
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: summarySystemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(files),
          },
        ],
      },
      "pull request summary generation",
    );

    if (!isChatResponse(response)) {
      throw new HttpError(502, "OpenRouter returned an invalid summary response.");
    }

    const summary = response.choices[0]?.message.content.trim();

    if (!summary) {
      throw new HttpError(502, "OpenRouter returned an empty pull request summary.");
    }

    return summary;
  } catch (error: unknown) {
    console.error("Unable to generate pull request summary; using fallback.", error);
    return summaryFallback;
  }
}
