import axios from "axios";

import type { HealthGrade, HealthTrend, RepositoryHealth, Review } from "./types/api";

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function requestErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The API request could not be completed.";
  }

  return "An unexpected application error occurred.";
}

function healthGrade(average: number): HealthGrade {
  if (average >= 8.5) {
    return "A";
  }

  if (average >= 7) {
    return "B";
  }

  if (average >= 5.5) {
    return "C";
  }

  if (average >= 4) {
    return "D";
  }

  return "F";
}

function averageScore(scores: number[]): number {
  return scores.length === 0
    ? 0
    : scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function repositoryHealthFromReviews(reviews: Review[]): RepositoryHealth {
  const latestReviews = [...reviews]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 10);
  const scores = latestReviews.map((review) => review.score);
  const currentAverage = averageScore(scores.slice(0, 5));
  const previousScores = scores.slice(5, 10);
  const change = currentAverage - averageScore(previousScores);
  let trend: HealthTrend = "stable";

  if (previousScores.length > 0 && change > 0.5) {
    trend = "up";
  } else if (previousScores.length > 0 && change < -0.5) {
    trend = "down";
  }

  const average = averageScore(scores);

  return {
    grade: healthGrade(average),
    average,
    trend,
    reviewCount: scores.length,
    lastReviewedAt: latestReviews[0]?.createdAt ?? null,
  };
}
