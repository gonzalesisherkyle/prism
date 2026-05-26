import { Plus, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  fetchRepositories,
  fetchReviews,
  registerRepository,
} from "../api/client";
import { HealthSummaryBar } from "../components/HealthSummaryBar";
import { PageHeader } from "../components/PageHeader";
import { RepoCard } from "../components/RepoCard";
import { ReviewSearchBar } from "../components/ReviewSearchBar";
import { SearchResults } from "../components/SearchResults";
import { StatusPanel } from "../components/StatusPanel";
import { usePageTitle } from "../hooks/usePageTitle";
import { useReviewSearch } from "../hooks/useReviewSearch";
import type { DashboardRepository, HealthGrade, RepositoryWithHealth } from "../types/api";
import { requestErrorMessage } from "../utils";

function latestScore(reviews: Awaited<ReturnType<typeof fetchReviews>>): number | null {
  if (reviews.length === 0) {
    return null;
  }

  const newestReview = [...reviews].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  )[0];

  return newestReview?.score ?? null;
}

export function Dashboard() {
  const location = useLocation();
  const isReposView = location.pathname === "/repos";
  const [repos, setRepos] = useState<DashboardRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [repoFullName, setRepoFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<HealthGrade | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const search = useReviewSearch(searchQuery);

  usePageTitle(isReposView ? "Repositories" : "Dashboard");

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const registeredRepos = await fetchRepositories();
      const enhancedRepos = await Promise.all(
        registeredRepos.map(async (repo: RepositoryWithHealth) => {
          try {
            const reviews = await fetchReviews(repo.repoId);

            return {
              ...repo,
              lastReviewScore: latestScore(reviews),
              totalReviews: reviews.length,
            };
          } catch {
            return {
              ...repo,
              lastReviewScore: null,
              totalReviews: 0,
            };
          }
        }),
      );

      setRepos(enhancedRepos);
    } catch (requestError) {
      setError(requestErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRepos();
  }, [loadRepos]);

  useEffect(() => {
    if (
      gradeFilter &&
      !repos.some(
        (repo) => repo.health.reviewCount >= 3 && repo.health.grade === gradeFilter,
      )
    ) {
      setGradeFilter(null);
    }
  }, [gradeFilter, repos]);

  const filteredRepos = useMemo(
    () =>
      gradeFilter
        ? repos.filter(
            (repo) => repo.health.reviewCount >= 3 && repo.health.grade === gradeFilter,
          )
        : repos,
    [gradeFilter, repos],
  );

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = repoFullName.trim();

    if (!value) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await registerRepository(value);
      setRepoFullName("");
      setFormOpen(false);
      await loadRepos();
    } catch (requestError) {
      setError(requestErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        action={
          <button
            className={formOpen ? "button-ghost" : "button-primary"}
            onClick={() => setFormOpen((open) => !open)}
            type="button"
          >
            {formOpen ? <X aria-hidden="true" size={16} /> : <Plus aria-hidden="true" size={16} />}
            {formOpen ? "Cancel" : "Add repo"}
          </button>
        }
        description="Monitor repository review health and inspect Prism findings."
        eyebrow={isReposView ? "CONFIGURED TARGETS" : "COMMAND CENTER"}
        title={isReposView ? "Registered repositories" : "Dashboard"}
      />

      {!isReposView && (
        <ReviewSearchBar
          loading={search.loading}
          onChange={setSearchQuery}
          value={searchQuery}
        />
      )}

      {!isReposView && !search.hasQuery && !loading && !error && repos.length > 0 && (
        <HealthSummaryBar
          onSelectGrade={setGradeFilter}
          repos={repos}
          selectedGrade={gradeFilter}
        />
      )}

      {formOpen && (
        <form className="panel mb-xl flex flex-col gap-md p-lg sm:flex-row border-primary/30 shadow-lg shadow-primary/5 relative overflow-hidden transition-all duration-500" onSubmit={handleRegister}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary-container to-transparent" />
          <label className="flex-1">
            <span className="label-caps mb-sm block text-primary font-semibold">REPOSITORY FULL NAME</span>
            <input
              autoFocus
              className="field"
              onChange={(event) => setRepoFullName(event.target.value)}
              placeholder="owner/repository"
              required
              value={repoFullName}
            />
          </label>
          <button className="button-primary self-end h-[38px] sm:h-[40px] px-lg" disabled={submitting} type="submit">
            {submitting ? "Registering..." : "Register repo"}
          </button>
        </form>
      )}

      {!isReposView && search.hasQuery ? (
        <SearchResults
          error={search.error}
          loading={search.loading}
          query={searchQuery}
          results={search.results}
        />
      ) : loading ? (
        <StatusPanel label="LOADING" message="Fetching registered repositories..." />
      ) : error ? (
        <StatusPanel label="REQUEST ERROR" message={error} tone="error" />
      ) : repos.length === 0 ? (
        <StatusPanel
          label="NO REPOSITORIES"
          message="Register a GitHub repository to begin automated pull request reviews."
        />
      ) : filteredRepos.length === 0 ? (
        <StatusPanel label="NO MATCHING HEALTH GRADE" message="No repositories match the selected health grade." />
      ) : (
        <section aria-label="Registered repositories" className="mt-lg grid grid-cols-12 gap-md">
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.repoId} repo={repo} />
          ))}
        </section>
      )}
    </>
  );
}
