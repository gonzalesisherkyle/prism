import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";

const openRouterBaseUrl = "https://openrouter.ai/api/v1";
const rateLimitRetryDelayMilliseconds = 5_000;

export type OpenRouterEndpoint = "/chat/completions" | "/embeddings";

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function responseErrorMessage(payload: unknown): string | undefined {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return undefined;
  }

  return typeof payload.error.message === "string" ? payload.error.message : undefined;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

export async function requestOpenRouter(
  endpoint: OpenRouterEndpoint,
  body: Record<string, unknown>,
  operationName: string,
): Promise<unknown> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(`${openRouterBaseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://prism.app",
          "X-Title": "Prism",
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new HttpError(502, `Unable to reach OpenRouter during ${operationName}.`);
    }

    const payload = await readJson(response);

    if (response.status === 429 && attempt === 0) {
      // Free-tier capacity can be brief; retry once after the requested backoff window.
      await sleep(rateLimitRetryDelayMilliseconds);
      continue;
    }

    if (!response.ok) {
      const message = responseErrorMessage(payload);
      const detail = message ? `: ${message}` : "";
      const statusCode = response.status === 429 ? 503 : 502;

      throw new HttpError(statusCode, `OpenRouter ${operationName} failed${detail}.`);
    }

    return payload;
  }

  throw new HttpError(503, `OpenRouter ${operationName} remains rate limited.`);
}

