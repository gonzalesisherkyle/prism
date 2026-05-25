import { Plus, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  fetchRepositories,
  fetchReviews,
  registerRepository,
} from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { RepoCard } from "../components/RepoCard";
import { StatusPanel } from "../components/StatusPanel";
import { usePageTitle } from "../hooks/usePageTitle";
import type { DashboardRepository, Repository } from "../types/api";
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

  usePageTitle(isReposView ? "Repositories" : "Dashboard");

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const registeredRepos = await fetchRepositories();
      const enhancedRepos = await Promise.all(
        registeredRepos.map(async (repo: Repository) => {
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

      {formOpen && (
        <form className="panel mb-xl flex flex-col gap-md p-lg sm:flex-row" onSubmit={handleRegister}>
          <label className="flex-1">
            <span className="label-caps mb-sm block">REPOSITORY FULL NAME</span>
            <input
              autoFocus
              className="field"
              onChange={(event) => setRepoFullName(event.target.value)}
              placeholder="owner/repository"
              required
              value={repoFullName}
            />
          </label>
          <button className="button-primary self-end" disabled={submitting} type="submit">
            {submitting ? "Registering..." : "Register repo"}
          </button>
        </form>
      )}

      {loading ? (
        <StatusPanel label="LOADING" message="Fetching registered repositories..." />
      ) : error ? (
        <StatusPanel label="REQUEST ERROR" message={error} tone="error" />
      ) : repos.length === 0 ? (
        <StatusPanel
          label="NO REPOSITORIES"
          message="Register a GitHub repository to begin automated pull request reviews."
        />
      ) : (
        <section aria-label="Registered repositories" className="mt-lg grid grid-cols-12 gap-md">
          {repos.map((repo) => (
            <RepoCard key={repo.repoId} repo={repo} />
          ))}
        </section>
      )}
    </>
  );
}
