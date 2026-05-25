import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { StatusPanel } from "../components/StatusPanel";
import { useAuth } from "../hooks/useAuth";
import { usePageTitle } from "../hooks/usePageTitle";

export function AuthCallback() {
  const [searchParameters] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const token = searchParameters.get("token");

  usePageTitle("Authentication");

  useEffect(() => {
    if (token) {
      login(token);
      navigate("/dashboard", { replace: true });
    }
  }, [login, navigate, token]);

  if (!token && isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-md">
      <div className="w-full max-w-[480px]">
        {token ? (
          <StatusPanel label="AUTHENTICATING" message="Completing GitHub authentication..." />
        ) : (
          <StatusPanel
            label="AUTHENTICATION FAILED"
            message="No access token was provided by the authentication callback."
            tone="error"
          />
        )}
      </div>
    </main>
  );
}

