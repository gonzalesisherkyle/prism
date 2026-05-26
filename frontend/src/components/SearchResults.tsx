import type { SearchResult } from "../types/api";
import { ReviewPreviewCard } from "./ReviewPreviewCard";
import { StatusPanel } from "./StatusPanel";

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  showReadyState?: boolean;
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
        <ReviewPreviewCard
          createdAt={result.createdAt}
          key={result._id}
          prTitle={result.prTitle}
          repoFullName={result.repoFullName}
          reviewId={result._id}
          score={result.score}
          similarity={result.similarity}
          summary={result.summary}
        />
      ))}
    </section>
  );
}
