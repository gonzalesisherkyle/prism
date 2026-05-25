import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardRepository } from "../types/api";
import { ScoreBadge, scoreTone } from "./ScoreBadge";

interface RepoCardProps {
  repo: DashboardRepository;
}

function topBorderColor(score: number | null): string {
  switch (scoreTone(score)) {
    case "critical":
      return "border-t-error";
    case "warning":
      return "border-t-tertiary";
    case "success":
      return "border-t-diagnostic-success";
    default:
      return "border-t-primary-container";
  }
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <Link
      className={`panel col-span-12 border-t-2 p-lg transition-colors hover:border-ai-active md:col-span-6 xl:col-span-4 ${topBorderColor(repo.lastReviewScore)}`}
      state={{ repoFullName: repo.fullName }}
      to={`/repos/${repo.repoId}/reviews`}
    >
      <div className="mb-lg flex items-start justify-between gap-md">
        <div className="min-w-0">
          <p className="label-caps mb-sm">REPOSITORY</p>
          <h2 className="truncate font-mono text-code-md font-medium text-on-surface">
            {repo.fullName}
          </h2>
        </div>
        <ArrowRight aria-hidden="true" className="shrink-0 text-outline" size={18} />
      </div>

      <div className="flex items-end justify-between gap-md border-t border-structure pt-md">
        <div>
          <p className="label-caps mb-sm">LAST REVIEW</p>
          <ScoreBadge score={repo.lastReviewScore} />
        </div>
        <div className="text-right">
          <p className="label-caps mb-sm">PRS REVIEWED</p>
          <p className="font-mono text-title-sm text-on-surface">{repo.totalReviews}</p>
        </div>
      </div>
    </Link>
  );
}

