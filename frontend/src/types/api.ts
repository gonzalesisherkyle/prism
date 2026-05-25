export type ReviewSeverity = "critical" | "warning" | "suggestion";

export interface Repository {
  id?: string;
  repoId: number;
  fullName: string;
  webhookId?: number;
  ownerId?: string;
  createdAt: string;
}

export interface ReviewComment {
  path: string;
  line: number;
  severity: ReviewSeverity;
  body: string;
}

export interface Review {
  id?: string;
  _id?: string;
  prNumber: number;
  prTitle: string;
  repoId: number;
  repoFullName: string;
  score: number;
  summary: string;
  comments: ReviewComment[];
  headSha: string;
  createdAt: string;
}

export interface DashboardRepository extends Repository {
  lastReviewScore: number | null;
  totalReviews: number;
}

export function reviewIdentifier(review: Review): string {
  return review.id ?? review._id ?? `${review.repoId}-${review.prNumber}-${review.headSha}`;
}

