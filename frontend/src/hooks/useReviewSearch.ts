import { useEffect, useState } from "react";

import { searchReviews } from "../api/client";
import type { SearchResult } from "../types/api";
import { requestErrorMessage } from "../utils";

interface ReviewSearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  hasQuery: boolean;
}

export function useReviewSearch(query: string, repoId?: number): ReviewSearchState {
  const normalizedQuery = query.trim();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setResults([]);

    if (!normalizedQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void searchReviews(normalizedQuery, repoId, controller.signal)
        .then((searchResults) => {
          if (!controller.signal.aborted) {
            setResults(searchResults);
          }
        })
        .catch((requestError: unknown) => {
          if (!controller.signal.aborted) {
            setError(requestErrorMessage(requestError));
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [normalizedQuery, repoId]);

  return {
    results,
    loading,
    error,
    hasQuery: Boolean(normalizedQuery),
  };
}
