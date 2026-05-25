import "dotenv/config";

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
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
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readPort(),
  mongoUri: requireEnvironmentVariable("MONGODB_URI"),
  frontendUrl: requireEnvironmentVariable("FRONTEND_URL").replace(/\/$/, ""),
  publicApiUrl: requireEnvironmentVariable("PUBLIC_API_URL").replace(/\/$/, ""),
  githubClientId: requireEnvironmentVariable("GITHUB_CLIENT_ID"),
  githubClientSecret: requireEnvironmentVariable("GITHUB_CLIENT_SECRET"),
  githubCallbackUrl: requireEnvironmentVariable("GITHUB_CALLBACK_URL"),
  jwtSecret: requireEnvironmentVariable("JWT_SECRET"),
  githubWebhookSecret: requireEnvironmentVariable("GITHUB_WEBHOOK_SECRET"),
  openRouterApiKey: requireEnvironmentVariable("OPENROUTER_API_KEY"),
};
