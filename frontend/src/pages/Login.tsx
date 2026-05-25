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
    <main className="relative flex min-h-screen items-center justify-center bg-surface px-md overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-[20%] left-[15%] h-80 w-80 rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] h-80 w-80 rounded-full bg-ai-active/10 blur-[120px] pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <section className="relative w-full max-w-[440px] border border-structure/60 bg-card/80 backdrop-blur-xl p-xl rounded-none text-center shadow-2xl shadow-black/80 overflow-hidden">
        {/* Glow Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary-container to-diagnostic-suggestion" />
        
        <div className="mb-xl flex justify-center scale-105">
          <Logo />
        </div>
        <p className="label-caps mb-md text-primary tracking-[0.15em] font-semibold">AI CODE REVIEW ASSISTANT</p>
        <h1 className="mb-md text-display-lg font-bold tracking-tight text-on-surface leading-tight">
          Connect your workflow.
        </h1>
        <p className="mb-xl text-body-md text-secondary leading-relaxed px-sm">
          Prism analyzes pull requests and posts precise inline review comments directly to GitHub.
        </p>
        <a className="button-github w-full flex items-center justify-center gap-md py-lg" href={`${apiBaseUrl}/auth/github`}>
          <GitHubMark />
          <span>Sign in with GitHub</span>
        </a>
        <p className="mt-lg font-mono text-[11px] text-outline tracking-normal">
          Repository access is required for automated reviews.
        </p>
      </section>
    </main>
  );
}

