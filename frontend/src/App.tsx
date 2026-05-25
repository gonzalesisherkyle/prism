import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { AuthCallback } from "./pages/AuthCallback";
import { Login } from "./pages/Login";

const Dashboard = lazy(async () => {
  const module = await import("./pages/Dashboard");
  return { default: module.Dashboard };
});
const ReviewDetail = lazy(async () => {
  const module = await import("./pages/ReviewDetail");
  return { default: module.ReviewDetail };
});
const ReviewIndex = lazy(async () => {
  const module = await import("./pages/ReviewIndex");
  return { default: module.ReviewIndex };
});
const ReviewList = lazy(async () => {
  const module = await import("./pages/ReviewList");
  return { default: module.ReviewList };
});
const Settings = lazy(async () => {
  const module = await import("./pages/Settings");
  return { default: module.Settings };
});

function EntryRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hasOAuthToken = new URLSearchParams(location.search).has("token");

  if (hasOAuthToken) {
    return <AuthCallback />;
  }

  return <Navigate replace to={isAuthenticated ? "/dashboard" : "/login"} />;
}

function ApplicationRoutes() {
  return (
    <Routes>
      <Route element={<EntryRoute />} path="/" />
      <Route element={<Login />} path="/login" />
      <Route element={<AuthCallback />} path="/auth/callback" />
      <Route element={<AuthCallback />} path="/oauth/callback" />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            element={
              <Suspense fallback={<p className="label-caps">LOADING DASHBOARD</p>}>
                <Dashboard />
              </Suspense>
            }
            path="/dashboard"
          />
          <Route
            element={
              <Suspense fallback={<p className="label-caps">LOADING REPOSITORIES</p>}>
                <Dashboard />
              </Suspense>
            }
            path="/repos"
          />
          <Route
            element={
              <Suspense fallback={<p className="label-caps">LOADING REVIEWS</p>}>
                <ReviewList />
              </Suspense>
            }
            path="/repos/:repoId/reviews"
          />
          <Route
            element={
              <Suspense fallback={<p className="label-caps">LOADING REVIEWS</p>}>
                <ReviewIndex />
              </Suspense>
            }
            path="/reviews"
          />
          <Route
            element={
              <Suspense fallback={<p className="label-caps">LOADING REVIEW DETAIL</p>}>
                <ReviewDetail />
              </Suspense>
            }
            path="/reviews/:reviewId"
          />
          <Route
            element={
              <Suspense fallback={<p className="label-caps">LOADING SETTINGS</p>}>
                <Settings />
              </Suspense>
            }
            path="/settings"
          />
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ApplicationRoutes />
    </BrowserRouter>
  );
}
