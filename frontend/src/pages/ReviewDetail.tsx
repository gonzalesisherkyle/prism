import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchReview, fetchReviews } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ScoreBadge } from "../components/ScoreBadge";
import { ScoreTrendChart } from "../components/ScoreTrendChart";
import { SeverityBadge } from "../components/SeverityBadge";
import { StatusPanel } from "../components/StatusPanel";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Review, ReviewComment } from "../types/api";
import { formatDate, requestErrorMessage } from "../utils";

function groupByFilename(comments: ReviewComment[]): Array<[string, ReviewComment[]]> {
  const grouped = new Map<string, ReviewComment[]>();

  comments.forEach((comment) => {
    const existing = grouped.get(comment.path) ?? [];
    existing.push(comment);
    grouped.set(comment.path, existing);
  });

  return [...grouped.entries()];
}

export function ReviewDetail() {
  const { reviewId } = useParams();
  const [review, setReview] = useState<Review | null>(null);
  const [trend, setTrend] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle(review ? `PR #${review.prNumber}` : "Review Detail");

  useEffect(() => {
    if (!reviewId) {
      setError("The review identifier is missing.");
      setLoading(false);
      return;
    }

    const loadReview = async () => {
      try {
        const selectedReview = await fetchReview(reviewId);
        setReview(selectedReview);

        try {
          setTrend(await fetchReviews(selectedReview.repoId));
        } catch {
          setTrend([selectedReview]);
        }
      } catch (requestError) {
        setError(requestErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadReview();
  }, [reviewId]);

  const commentGroups = useMemo(
    () => (review ? groupByFilename(review.comments) : []),
    [review],
  );

  if (loading) {
    return <StatusPanel label="LOADING" message="Retrieving Prism review findings..." />;
  }

  if (error || !review) {
    return (
      <StatusPanel
        label="REQUEST ERROR"
        message={error ?? "The selected review could not be found."}
        tone="error"
      />
    );
  }

  return (
    <>
      <PageHeader
        action={<ScoreBadge large score={review.score} />}
        description={`${review.repoFullName} / PR #${review.prNumber} / ${formatDate(review.createdAt)}`}
        eyebrow="REVIEW DETAIL"
        title={review.prTitle}
      />

      <section className="panel mb-xl p-lg">
        <p className="label-caps mb-md">PRISM SUMMARY</p>
        <p className="max-w-4xl text-body-md leading-6 text-on-surface">{review.summary}</p>
      </section>

      {commentGroups.length === 0 ? (
        <StatusPanel label="NO INLINE FINDINGS" message="Prism did not identify actionable issues." />
      ) : (
        <section className="grid gap-md lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-label="Reviewed files" className="panel self-start p-md">
            <p className="label-caps mb-md">FILES</p>
            {commentGroups.map(([filename, comments]) => (
              <div className="border-l-2 border-primary-container px-md py-sm" key={filename}>
                <p className="break-all font-mono text-code-sm text-secondary">{filename}</p>
                <p className="mt-xs font-mono text-label-caps text-outline">
                  {comments.length} FINDING{comments.length === 1 ? "" : "S"}
                </p>
              </div>
            ))}
          </nav>

          <div className="grid gap-lg">
            {commentGroups.map(([filename, comments]) => (
              <section className="panel p-lg" key={filename}>
                <h2 className="mb-md border-b border-structure pb-md font-mono text-code-md text-on-surface">
                  {filename}
                </h2>
                <div className="grid gap-md">
                  {comments.map((comment, index) => (
                    <article className="border border-structure bg-comment p-md" key={`${comment.line}-${index}`}>
                      <header className="mb-md flex flex-wrap items-center justify-between gap-sm">
                        <div className="flex items-center gap-sm">
                          <span className="grid h-6 w-6 place-items-center bg-primary font-mono text-label-caps text-on-primary">
                            P
                          </span>
                          <span className="font-mono text-code-sm text-secondary">Prism</span>
                          <span className="font-mono text-code-sm text-outline">
                            line {comment.line}
                          </span>
                        </div>
                        <SeverityBadge severity={comment.severity} />
                      </header>
                      <p className="text-body-md text-on-surface">{comment.body}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}

      <ScoreTrendChart reviews={trend.length > 0 ? trend : [review]} />
    </>
  );
}

