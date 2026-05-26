import axios from "axios";

import { authStorageKey, clearStoredToken } from "../auth/storage";
import type {
  Repository,
  RepositoryHealth,
  RepositoryWithHealth,
  Review,
  SearchResult,
} from "../types/api";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ""),
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((request) => {
  const token = window.localStorage.getItem(authStorageKey);

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredToken();
    }

    return Promise.reject(error);
  },
);

function unpackCollection<T>(payload: T[] | { repos?: T[]; reviews?: T[] }): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.repos ?? payload.reviews ?? [];
}

function unpackRecord<T>(payload: T | { repo?: T; review?: T }): T {
  if (typeof payload === "object" && payload !== null) {
    if ("repo" in payload && payload.repo) {
      return payload.repo;
    }

    if ("review" in payload && payload.review) {
      return payload.review;
    }
  }

  return payload as T;
}

export async function fetchRepositories(): Promise<RepositoryWithHealth[]> {
  const response = await apiClient.get<
    RepositoryWithHealth[] | { repos: RepositoryWithHealth[] }
  >("/repos");

  return unpackCollection(response.data);
}

export async function registerRepository(repoFullName: string): Promise<Repository> {
  const response = await apiClient.post<Repository | { repo: Repository }>("/repos/register", {
    repoFullName,
  });

  return unpackRecord(response.data);
}

export async function fetchReviews(repoId: number): Promise<Review[]> {
  const response = await apiClient.get<Review[] | { reviews: Review[] }>("/reviews", {
    params: { repoId },
  });

  return unpackCollection(response.data);
}

export async function fetchRepositoryHealth(repoId: number): Promise<RepositoryHealth> {
  const response = await apiClient.get<RepositoryHealth>(
    `/repos/${encodeURIComponent(repoId)}/health`,
  );

  return response.data;
}

export async function fetchReview(reviewId: string): Promise<Review> {
  const response = await apiClient.get<Review | { review: Review }>(
    `/reviews/${encodeURIComponent(reviewId)}`,
  );

  return unpackRecord(response.data);
}

export async function searchReviews(
  query: string,
  repoId?: number,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const response = await apiClient.get<{ results: SearchResult[] }>("/search", {
    params: {
      q: query,
      ...(repoId === undefined ? {} : { repoId }),
    },
    signal,
  });

  return response.data.results;
}
