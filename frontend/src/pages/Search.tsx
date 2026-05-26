import { useEffect, useState } from "react";

import { fetchRepositories } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { ReviewSearchBar } from "../components/ReviewSearchBar";
import { SearchResults } from "../components/SearchResults";
import { usePageTitle } from "../hooks/usePageTitle";
import { useReviewSearch } from "../hooks/useReviewSearch";
import type { Repository } from "../types/api";
import { requestErrorMessage } from "../utils";

export function Search() {
  const [query, setQuery] = useState("");
  const [repoFilter, setRepoFilter] = useState("");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repositoriesLoading, setRepositoriesLoading] = useState(true);
  const [repositoriesError, setRepositoriesError] = useState<string | null>(null);
  const selectedRepoId = repoFilter ? Number(repoFilter) : undefined;
  const search = useReviewSearch(query, selectedRepoId);

  usePageTitle("Search");

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setRepositories(await fetchRepositories());
      } catch (requestError) {
        setRepositoriesError(requestErrorMessage(requestError));
      } finally {
        setRepositoriesLoading(false);
      }
    };

    void loadRepositories();
  }, []);

  return (
    <>
      <PageHeader
        description="Find completed reviews by concept and implementation meaning."
        eyebrow="KNOWLEDGE RETRIEVAL"
        title="Semantic search"
      />

      <ReviewSearchBar loading={search.loading} onChange={setQuery} value={query}>
        <label>
          <span className="label-caps mb-sm block text-primary">REPOSITORY FILTER</span>
          <select
            aria-label="Filter results by repository"
            className="field py-md"
            disabled={repositoriesLoading}
            onChange={(event) => setRepoFilter(event.target.value)}
            value={repoFilter}
          >
            <option value="">All repositories</option>
            {repositories.map((repository) => (
              <option key={repository.repoId} value={repository.repoId}>
                {repository.fullName}
              </option>
            ))}
          </select>
          {repositoriesError && (
            <p className="mt-sm text-body-sm text-error">Repository filters unavailable.</p>
          )}
        </label>
      </ReviewSearchBar>

      <SearchResults
        error={search.error}
        loading={search.loading}
        query={query}
        results={search.results}
        showReadyState
      />
    </>
  );
}
