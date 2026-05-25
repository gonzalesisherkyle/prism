export type ReviewSeverity = "critical" | "warning" | "suggestion";

export interface ReviewComment {
  path: string;
  line: number;
  severity: ReviewSeverity;
  body: string;
}

export interface FileReviewResult {
  score: number;
  summary: string;
  comments: ReviewComment[];
}

