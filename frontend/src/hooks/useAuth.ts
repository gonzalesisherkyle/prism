import { useCallback, useEffect, useMemo, useState } from "react";

import {
  authChangedEvent,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../auth/storage";

export interface AuthenticatedUser {
  id?: string;
  githubId?: string;
  username?: string;
}

interface JwtClaims {
  sub?: unknown;
  githubId?: unknown;
  username?: unknown;
}

export interface AuthState {
  token: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

function readJwtUser(token: string | null): AuthenticatedUser | null {
  if (!token) {
    return null;
  }

  try {
    const encodedPayload = token.split(".")[1];

    if (!encodedPayload) {
      return null;
    }

    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const claims = JSON.parse(window.atob(base64 + padding)) as JwtClaims;

    return {
      ...(typeof claims.sub === "string" ? { id: claims.sub } : {}),
      ...(typeof claims.githubId === "string" ? { githubId: claims.githubId } : {}),
      ...(typeof claims.username === "string" ? { username: claims.username } : {}),
    };
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    const syncToken = () => {
      setToken(getStoredToken());
    };

    window.addEventListener("storage", syncToken);
    window.addEventListener(authChangedEvent, syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener(authChangedEvent, syncToken);
    };
  }, []);

  const login = useCallback((newToken: string) => {
    setStoredToken(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
  }, []);

  return {
    token,
    user: useMemo(() => readJwtUser(token), [token]),
    isAuthenticated: Boolean(token),
    login,
    logout,
  };
}

