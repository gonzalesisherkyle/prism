import type { ErrorRequestHandler } from "express";

import { HttpError } from "../errors/HttpError.js";

interface MongoDuplicateKeyError {
  code: number;
}

interface BodyParserError {
  status: number;
  type: string;
}

function isMongoDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "type" in error &&
    typeof error.status === "number" &&
    typeof error.type === "string"
  );
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (isMongoDuplicateKeyError(error)) {
    response.status(409).json({ message: "This repository is already registered." });
    return;
  }

  if (isBodyParserError(error) && error.status === 413) {
    response.status(413).json({ message: "Request body exceeds the allowed size." });
    return;
  }

  if (error instanceof SyntaxError) {
    response.status(400).json({ message: "Request body contains invalid JSON." });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "An unexpected server error occurred." });
};
