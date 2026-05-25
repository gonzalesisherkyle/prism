import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

export interface Repo {
  repoId: number;
  fullName: string;
  webhookId: number;
  ownerId: Types.ObjectId;
  createdAt: Date;
}

export type RepoDocument = HydratedDocument<Repo>;

const repoSchema = new Schema<Repo>(
  {
    repoId: {
      type: Number,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    webhookId: {
      type: Number,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
  },
  {
    versionKey: false,
  },
);

// One user should never install multiple Prism webhooks for the same GitHub repository.
repoSchema.index({ ownerId: 1, repoId: 1 }, { unique: true });

export const RepoModel: Model<Repo> = model<Repo>("Repo", repoSchema);

