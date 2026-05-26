import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { SearchResult } from "../types/api";
import { formatDate } from "../utils";
import { ScoreBadge } from "./ScoreBadge";
import { StatusPanel } from "./StatusPanel";

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  showReadyState?: boolean;
}

function similarityPercentage(similarity: number): number {
  return Math.round(Math.max(0, Math.min(1, similarity)) * 100);
}

export function SearchResults({
  query,
  results,
  loading,
  error,
  showReadyState = false,
}: SearchResultsProps) {
  if (!query.trim()) {
    return showReadyState ? (
      <StatusPanel
        label="SEARCH READY"
        message="Enter a concept, risk, or implementation area to find related reviews."
      />
    ) : null;
  }

  if (loading) {
    return <StatusPanel label="LOADING" message="Finding semantically related reviews..." />;
  }

  if (error) {
    return <StatusPanel label="SEARCH ERROR" message={error} tone="error" />;
  }

  if (results.length === 0) {
    return <StatusPanel label="NO MATCHES" message="No completed reviews match this search." />;
  }

  return (
    <section aria-label="Semantic search results" className="grid gap-md">
      {results.map((result) => (
        <Link
          className="panel group flex flex-col gap-md border-l-4 border-l-primary/60 p-lg transition-all duration-300 hover:-translate-y-[2px] hover:border-primary hover:shadow-2xl hover:shadow-primary/10 sm:flex-row sm:items-center"
          key={result._id}
          to={`/reviews/${encodeURIComponent(result._id)}`}
        >
          <div className="min-w-0 flex-1">
            <div className="mb-sm flex flex-wrap items-center gap-md">
              <p className="label-caps text-primary">{result.repoFullName}</p>
              <ScoreBadge score={result.score} />
              <p className="font-mono text-code-sm text-outline">{formatDate(result.createdAt)}</p>
            </div>
            <h2 className="mb-xs truncate text-title-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
              {result.prTitle}
            </h2>
            <p className="truncate text-body-md text-secondary">{result.summary}</p>
          </div>
          <div className="flex shrink-0 items-center gap-md sm:pl-md">
            <div className="border border-primary/20 bg-primary/10 px-md py-sm text-right">
              <p className="label-caps mb-xs text-primary">SIMILARITY</p>
              <p className="font-mono text-title-sm font-semibold text-on-surface">
                {similarityPercentage(result.similarity)}%
              </p>
            </div>
            <ArrowRight
              aria-hidden="true"
              className="text-outline transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
              size={18}
            />
          </div>
        </Link>
      ))}
    </section>
  );
}
