import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectToDatabase(): Promise<void> {
  // Mongoose manages pooling and reconnect behavior once this initial connection succeeds.
  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB.");
}

