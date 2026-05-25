import { Navigate } from "react-router-dom";

import { Logo } from "../components/Logo";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

function GitHubMark() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 16 16">
      <path
        d="M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.39v-1.36c-2.24.49-2.71-1.08-2.71-1.08-.37-.93-.9-1.18-.9-1.18-.73-.5.06-.49.06-.49.81.06 1.24.83 1.24.83.72 1.24 1.89.88 2.35.67.07-.52.28-.88.51-1.08-1.79-.2-3.67-.89-3.67-3.96 0-.88.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .68-.22 2.2.82A7.7 7.7 0 0 1 8 4.25c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.27.83 2.15 0 3.08-1.88 3.76-3.68 3.96.29.25.55.74.55 1.5v1.97c0 .22.14.46.55.39A8 8 0 0 0 8 .2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Login() {
  const { isAuthenticated } = useAuth();

  usePageTitle("Sign In");

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-md">
      <section className="w-full max-w-[432px] border border-structure bg-card p-xl text-center">
        <div className="mb-xl flex justify-center">
          <Logo />
        </div>
        <p className="label-caps mb-md">AI CODE REVIEW ASSISTANT</p>
        <h1 className="mb-md text-display-lg text-on-surface">Connect your workflow.</h1>
        <p className="mb-xl text-body-md text-secondary">
          Prism analyzes pull requests and posts precise inline review comments to GitHub.
        </p>
        <a className="button-github w-full" href={`${apiBaseUrl}/auth/github`}>
          <GitHubMark />
          Sign in with GitHub
        </a>
        <p className="mt-lg font-mono text-code-sm text-outline">
          Repository access is required for automated reviews.
        </p>
      </section>
    </main>
  );
}

