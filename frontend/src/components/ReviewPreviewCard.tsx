import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { formatDate } from "../utils";
import { ScoreBadge } from "./ScoreBadge";

interface ReviewPreviewBaseProps {
  reviewId: string;
  prTitle: string;
  summary: string;
  score: number;
  createdAt: string;
}

type ReviewPreviewCardProps = ReviewPreviewBaseProps &
  (
    | {
        repoFullName: string;
        similarity: number;
        prNumber?: never;
      }
    | {
        prNumber: number;
        repoFullName?: never;
        similarity?: never;
      }
  );

function similarityPercentage(similarity: number): number {
  return Math.round(Math.max(0, Math.min(1, similarity)) * 100);
}

export function ReviewPreviewCard(props: ReviewPreviewCardProps) {
  const similarity = props.similarity;
  const showsSimilarity = similarity !== undefined;

  return (
    <Link
      className={`panel group flex min-w-0 max-w-full flex-col gap-md overflow-hidden p-lg transition-all duration-300 hover:-translate-y-[2px] hover:border-primary/40 hover:shadow-2xl sm:flex-row sm:items-center ${
        showsSimilarity
          ? "border-l-4 border-l-primary/60 hover:border-primary hover:shadow-primary/10"
          : "hover:shadow-primary/5"
      }`}
      to={`/reviews/${encodeURIComponent(props.reviewId)}`}
    >
      <div className="min-w-0 max-w-full flex-1 overflow-hidden">
        <div className="mb-sm flex min-w-0 flex-wrap items-center gap-md">
          {"repoFullName" in props && props.repoFullName ? (
            <p className="label-caps max-w-full truncate text-primary">{props.repoFullName}</p>
          ) : (
            <span className="border border-structure/50 bg-surface-container-high/60 px-sm py-0.5 font-mono text-code-sm text-secondary">
              PR #{props.prNumber}
            </span>
          )}
          <ScoreBadge score={props.score} />
          <p className="font-mono text-code-sm text-outline">{formatDate(props.createdAt)}</p>
        </div>
        <h2 className="mb-xs block max-w-full truncate text-title-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
          {props.prTitle}
        </h2>
        <p className="block max-w-full truncate text-body-md leading-relaxed text-secondary">
          {props.summary}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-md sm:pl-md">
        {similarity !== undefined && (
          <div className="border border-primary/20 bg-primary/10 px-md py-sm text-right">
            <p className="label-caps mb-xs text-primary">SIMILARITY</p>
            <p className="font-mono text-title-sm font-semibold text-on-surface">
              {similarityPercentage(similarity)}%
            </p>
          </div>
        )}
        <ArrowRight
          aria-hidden="true"
          className="shrink-0 text-outline transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
          size={18}
        />
      </div>
    </Link>
  );
}
