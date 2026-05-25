import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPublicUrl(name: string): string {
  const value = requireEnvironmentVariable(name).replace(/\/$/, "");

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }

  if (nodeEnv === "production" && url.protocol !== "https:") {
    throw new Error(`${name} must use https:// in production.`);
  }

  return value;
}

function readPort(): number {
  const parsedPort = Number(process.env.PORT ?? 4000);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return parsedPort;
}

// Resolve required configuration once at startup so deployment errors fail fast.
export const env = {
  nodeEnv,
  port: readPort(),
  mongoUri: requireEnvironmentVariable("MONGODB_URI"),
  frontendUrl: readPublicUrl("FRONTEND_URL"),
  publicApiUrl: readPublicUrl("PUBLIC_API_URL"),
  githubClientId: requireEnvironmentVariable("GITHUB_CLIENT_ID"),
  githubClientSecret: requireEnvironmentVariable("GITHUB_CLIENT_SECRET"),
  githubCallbackUrl: readPublicUrl("GITHUB_CALLBACK_URL"),
  jwtSecret: requireEnvironmentVariable("JWT_SECRET"),
  githubWebhookSecret: requireEnvironmentVariable("GITHUB_WEBHOOK_SECRET"),
  openRouterApiKey: requireEnvironmentVariable("OPENROUTER_API_KEY"),
};
