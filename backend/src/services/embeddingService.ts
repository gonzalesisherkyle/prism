import { HttpError } from "../errors/HttpError.js";
import { requestOpenRouter } from "./openRouterClient.js";

const embeddingModel = "nvidia/llama-nemotron-embed-vl-1b-v2:free";

interface OpenRouterEmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEmbeddingResponse(value: unknown): value is OpenRouterEmbeddingResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || value.data.length === 0) {
    return false;
  }

  const firstEmbedding = value.data[0];

  return (
    isRecord(firstEmbedding) &&
    Array.isArray(firstEmbedding.embedding) &&
    firstEmbedding.embedding.length > 0 &&
    firstEmbedding.embedding.every(
      (entry) => typeof entry === "number" && Number.isFinite(entry),
    )
  );
}

export async function getEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new HttpError(400, "Cannot create an embedding for empty text.");
  }

  const response = await requestOpenRouter(
    "/embeddings",
    {
      model: embeddingModel,
      input: text,
      encoding_format: "float",
    },
    "embedding request",
  );

  if (!isEmbeddingResponse(response)) {
    throw new HttpError(502, "OpenRouter returned an invalid embedding response.");
  }

  const embedding = response.data[0];

  if (!embedding) {
    throw new HttpError(502, "OpenRouter returned an empty embedding response.");
  }

  return embedding.embedding;
}
