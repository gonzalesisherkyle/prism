import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import express from "express";

import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { HttpError } from "./errors/HttpError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import repoRouter from "./routes/repoRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import webhookRouter from "./routes/webhookRoutes.js";

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || origin === env.frontendUrl) {
      callback(null, true);
      return;
    }

    callback(new HttpError(403, "This browser origin is not permitted."));
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  maxAge: 86_400,
};

// Application-level CORS handles preflight OPTIONS for every browser API route.
app.use(cors(corsOptions));

// Register the webhook endpoint before JSON parsing so its HMAC sees GitHub's raw bytes.
app.use("/webhook", webhookRouter);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

// Keeping auth at a stable root path matches the OAuth callback configured at GitHub.
app.use("/auth", authRouter);
app.use("/repos", repoRouter);
app.use("/reviews", reviewRouter);
app.use("/search", searchRouter);

app.use(errorHandler);

async function startServer(): Promise<void> {
  await connectToDatabase();

  app.listen(env.port, () => {
    console.log(`Prism API listening on port ${env.port}.`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Unable to start Prism API.", error);
  process.exit(1);
});

export default app;
