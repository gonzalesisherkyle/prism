import { Schema, model, type HydratedDocument, type Model } from "mongoose";

import type { ReviewComment, ReviewSeverity } from "../types/review.js";

export interface Review {
  prNumber: number;
  prTitle: string;
  repoId: number;
  repoFullName: string;
  score: number;
  summary: string;
  prSummary: string;
  summaryEmbedding: number[];
  shareToken?: string;
  isShareable: boolean;
  comments: ReviewComment[];
  headSha: string;
  createdAt: Date;
}

export type ReviewDocument = HydratedDocument<Review>;

const reviewCommentSchema = new Schema<ReviewComment>(
  {
    path: {
      type: String,
      required: true,
    },
    line: {
      type: Number,
      required: true,
      min: 1,
    },
    severity: {
      type: String,
      enum: ["critical", "warning", "suggestion"] satisfies ReviewSeverity[],
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const reviewSchema = new Schema<Review>(
  {
    prNumber: {
      type: Number,
      required: true,
    },
    prTitle: {
      type: String,
      required: true,
    },
    repoId: {
      type: Number,
      required: true,
      index: true,
    },
    repoFullName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    summary: {
      type: String,
      required: true,
    },
    prSummary: {
      type: String,
      default: "",
    },
    summaryEmbedding: {
      type: [Number],
      required: true,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    isShareable: {
      type: Boolean,
      required: true,
      default: false,
    },
    comments: {
      type: [reviewCommentSchema],
      default: [],
    },
    headSha: {
      type: String,
      required: true,
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

reviewSchema.index({ repoId: 1, prNumber: 1, createdAt: -1 });
reviewSchema.index({ repoId: 1, prNumber: 1, headSha: 1 }, { unique: true });

export const ReviewModel: Model<Review> = model<Review>("Review", reviewSchema);
