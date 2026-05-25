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

      <section className="panel mb-xl p-lg border-l-4 border-l-primary relative overflow-hidden shadow-lg shadow-primary/5">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
        <p className="label-caps mb-sm text-primary font-semibold">PRISM SUMMARY</p>
        <p className="max-w-4xl text-body-md leading-relaxed text-on-surface">{review.summary}</p>
      </section>

      {commentGroups.length === 0 ? (
        <StatusPanel label="NO INLINE FINDINGS" message="Prism did not identify actionable issues." />
      ) : (
        <section className="grid gap-md lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav aria-label="Reviewed files" className="panel self-start p-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/10 to-transparent" />
            <p className="label-caps mb-md text-primary font-semibold">FILES</p>
            <div className="grid gap-sm">
              {commentGroups.map(([filename, comments]) => (
                <div className="border-l-2 border-primary/50 px-md py-sm bg-surface-container-lowest/30 rounded-none border-structure/50 hover:bg-surface-container-high/30 transition-colors" key={filename}>
                  <p className="break-all font-mono text-code-sm text-secondary font-medium">{filename}</p>
                  <p className="mt-xs font-mono text-label-caps text-outline">
                    {comments.length} FINDING{comments.length === 1 ? "" : "S"}
                  </p>
                </div>
              ))}
            </div>
          </nav>

          <div className="grid gap-lg">
            {commentGroups.map(([filename, comments]) => (
              <section className="panel p-lg relative overflow-hidden" key={filename}>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/20 to-transparent" />
                <h2 className="mb-md border-b border-structure/50 pb-md font-mono text-code-md text-on-surface font-semibold flex items-center gap-sm">
                  <span className="h-2 w-2 bg-primary" />
                  {filename}
                </h2>
                <div className="grid gap-md">
                  {comments.map((comment, index) => (
                    <article className="border border-structure bg-surface-container-low/40 rounded-none p-md transition-all duration-300 hover:bg-surface-container-low/70 hover:shadow-md hover:border-structure-variant" key={`${comment.line}-${index}`}>
                      <header className="mb-md flex flex-wrap items-center justify-between gap-sm">
                        <div className="flex items-center gap-sm">
                          <span className="grid h-6 w-6 place-items-center rounded-none bg-gradient-to-br from-primary to-primary-container font-mono text-[10px] font-bold text-white shadow-md shadow-primary/25">
                            P
                          </span>
                          <span className="font-mono text-code-sm text-on-surface font-semibold">Prism AI</span>
                          <span className="font-mono text-code-sm text-outline">
                            line {comment.line}
                          </span>
                        </div>
                        <SeverityBadge severity={comment.severity} />
                      </header>
                      <p className="text-body-md text-on-surface leading-relaxed pl-[32px]">{comment.body}</p>
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

