import { Schema, model, type HydratedDocument, type Model } from "mongoose";

export interface User {
  githubId: string;
  username: string;
  avatarUrl: string;
  accessToken: string;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
      // Tokens are never returned by normal user queries; encrypt them at rest in production.
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel: Model<User> = model<User>("User", userSchema);

