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
      return "border-t-error/70 shadow-[inset_0_2px_6px_rgba(239,68,68,0.08)]";
    case "warning":
      return "border-t-tertiary/70 shadow-[inset_0_2px_6px_rgba(245,158,11,0.08)]";
    case "success":
      return "border-t-diagnostic-success/70 shadow-[inset_0_2px_6px_rgba(16,185,129,0.08)]";
    default:
      return "border-t-primary/70 shadow-[inset_0_2px_6px_rgba(99,102,241,0.08)]";
  }
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <Link
      className={`panel group col-span-12 border-t-4 p-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 md:col-span-6 xl:col-span-4 ${topBorderColor(repo.lastReviewScore)}`}
      state={{ repoFullName: repo.fullName }}
      to={`/repos/${repo.repoId}/reviews`}
    >
      <div className="mb-lg flex items-start justify-between gap-md">
        <div className="min-w-0">
          <p className="label-caps mb-sm text-outline group-hover:text-primary transition-colors">REPOSITORY</p>
          <h2 className="truncate font-mono text-code-md font-semibold text-on-surface">
            {repo.fullName}
          </h2>
        </div>
        <ArrowRight aria-hidden="true" className="shrink-0 text-outline transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" size={18} />
      </div>

      <div className="flex items-end justify-between gap-md border-t border-structure/50 pt-md">
        <div>
          <p className="label-caps mb-sm">LAST REVIEW</p>
          <ScoreBadge score={repo.lastReviewScore} />
        </div>
        <div className="text-right">
          <p className="label-caps mb-sm">PRS REVIEWED</p>
          <p className="font-mono text-title-sm text-on-surface font-semibold">{repo.totalReviews}</p>
        </div>
      </div>
    </Link>
  );
}

