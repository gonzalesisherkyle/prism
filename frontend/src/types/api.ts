export type ReviewSeverity = "critical" | "warning" | "suggestion";
export type HealthGrade = "A" | "B" | "C" | "D" | "F";
export type HealthTrend = "up" | "down" | "stable";

export interface RepositoryHealth {
  grade: HealthGrade;
  average: number;
  trend: HealthTrend;
  reviewCount: number;
  lastReviewedAt: string | null;
}

export interface Repository {
  id?: string;
  repoId: number;
  fullName: string;
  webhookId?: number;
  ownerId?: string;
  createdAt: string;
}

export interface RepositoryWithHealth extends Repository {
  health: RepositoryHealth;
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
  prSummary?: string;
  comments: ReviewComment[];
  headSha: string;
  createdAt: string;
}

export interface DashboardRepository extends RepositoryWithHealth {
  lastReviewScore: number | null;
  totalReviews: number;
}

export interface SearchResult {
  _id: string;
  prTitle: string;
  repoFullName: string;
  score: number;
  summary: string;
  createdAt: string;
  similarity: number;
}

export function reviewIdentifier(review: Review): string {
  return review.id ?? review._id ?? `${review.repoId}-${review.prNumber}-${review.headSha}`;
}
