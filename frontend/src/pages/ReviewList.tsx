import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { fetchReviews } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ReviewPreviewCard } from "../components/ReviewPreviewCard";
import { StatusPanel } from "../components/StatusPanel";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Review } from "../types/api";
import { reviewIdentifier } from "../types/api";
import { requestErrorMessage } from "../utils";

interface ReviewListLocationState {
  repoFullName?: string;
}

export function ReviewList() {
  const { repoId } = useParams();
  const location = useLocation();
  const state = location.state as ReviewListLocationState | null;
  const numericRepoId = Number(repoId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const repositoryName = state?.repoFullName ?? reviews[0]?.repoFullName ?? `Repository ${repoId}`;

  usePageTitle(`${repositoryName} Reviews`);

  useEffect(() => {
    if (!Number.isInteger(numericRepoId)) {
      setError("The repository identifier is invalid.");
      setLoading(false);
      return;
    }

    const loadReviews = async () => {
      try {
        const response = await fetchReviews(numericRepoId);
        setReviews(
          [...response].sort(
            (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
          ),
        );
      } catch (requestError) {
        setError(requestErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, [numericRepoId]);

  return (
    <>
      <PageHeader
        description="Pull request analyses completed by Prism for this repository."
        eyebrow="REVIEW HISTORY"
        title={repositoryName}
      />

      {loading ? (
        <StatusPanel label="LOADING" message="Fetching review history..." />
      ) : error ? (
        <StatusPanel label="REQUEST ERROR" message={error} tone="error" />
      ) : reviews.length === 0 ? (
        <StatusPanel label="NO REVIEWS" message="No pull requests have been reviewed yet." />
      ) : (
        <section aria-label="Repository review history" className="grid gap-md">
          {reviews.map((review) => (
            <ReviewPreviewCard
              createdAt={review.createdAt}
              key={reviewIdentifier(review)}
              prNumber={review.prNumber}
              prTitle={review.prTitle}
              reviewId={reviewIdentifier(review)}
              score={review.score}
              summary={review.summary}
            />
          ))}
        </section>
      )}
    </>
  );
}
