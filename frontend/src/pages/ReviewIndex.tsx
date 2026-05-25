import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchRepositories, fetchReviews } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ScoreBadge } from "../components/ScoreBadge";
import { StatusPanel } from "../components/StatusPanel";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Review } from "../types/api";
import { reviewIdentifier } from "../types/api";
import { formatDate, requestErrorMessage } from "../utils";

export function ReviewIndex() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle("Reviews");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const repos = await fetchRepositories();
        const repositoryReviews = await Promise.all(
          repos.map((repo) => fetchReviews(repo.repoId).catch(() => [])),
        );

        setReviews(
          repositoryReviews
            .flat()
            .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
        );
      } catch (requestError) {
        setError(requestErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, []);

  return (
    <>
      <PageHeader
        description="Most recent automated findings across registered repositories."
        eyebrow="REVIEW ACTIVITY"
        title="Reviews"
      />
      {loading ? (
        <StatusPanel label="LOADING" message="Fetching recent reviews..." />
      ) : error ? (
        <StatusPanel label="REQUEST ERROR" message={error} tone="error" />
      ) : reviews.length === 0 ? (
        <StatusPanel label="NO REVIEWS" message="Completed reviews will appear here." />
      ) : (
        <div className="grid gap-md">
          {reviews.map((review) => (
            <Link
              className="panel group flex items-center justify-between gap-md p-lg transition-all duration-300 hover:-translate-y-[2px] hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40"
              key={reviewIdentifier(review)}
              to={`/reviews/${reviewIdentifier(review)}`}
            >
              <div className="min-w-0">
                <p className="label-caps mb-sm text-primary font-semibold tracking-wider">{review.repoFullName}</p>
                <p className="mb-xs truncate text-title-sm text-on-surface font-semibold group-hover:text-primary transition-colors">{review.prTitle}</p>
                <p className="font-mono text-code-sm text-outline">{formatDate(review.createdAt)}</p>
              </div>
              <ScoreBadge score={review.score} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

