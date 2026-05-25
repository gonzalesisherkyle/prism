import { FolderGit2, LayoutDashboard, Menu, MessagesSquare, Settings, X } from "lucide-react";
import { type ComponentType, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { Logo } from "./Logo";

interface NavigationItem {
  label: string;
  to: string;
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  end?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Repos", to: "/repos", icon: FolderGit2 },
  { label: "Reviews", to: "/reviews", icon: MessagesSquare },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function AppShell() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const priorOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavigationOpen]);

  const handleLogout = () => {
    setMobileNavigationOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const navigation = (onNavigate?: () => void) => (
    <nav aria-label="Application sections" className="grid gap-xs px-md py-xl">
      {navigationItems.map(({ icon: Icon, ...item }) => (
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-md border-l-2 px-md py-sm text-body-md transition-colors ${
              isActive
                ? "border-primary-container bg-primary-container/10 text-on-surface"
                : "border-transparent text-outline hover:border-outline-variant hover:text-secondary"
            }`
          }
          end={item.end}
          key={item.label}
          onClick={onNavigate}
          to={item.to}
        >
          <Icon aria-hidden={true} className="shrink-0" size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const accountPanel = (
    <div className="mt-auto border-t border-structure p-lg">
      <p className="label-caps mb-sm">SIGNED IN</p>
      <p className="mb-md truncate font-mono text-code-sm text-secondary">
        {user?.username ?? "GitHub User"}
      </p>
      <button className="button-ghost w-full" onClick={handleLogout} type="button">
        Logout
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col border-r border-structure bg-card lg:flex">
        <div className="flex h-[72px] items-center border-b border-structure px-lg">
          <Logo />
        </div>

        {navigation()}
        {accountPanel}
      </aside>

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 border-0 bg-surface/80"
            onClick={() => setMobileNavigationOpen(false)}
            type="button"
          />

          <aside
            aria-label="Mobile navigation"
            className="relative flex h-full w-sidebar max-w-[calc(100%-40px)] flex-col border-r border-structure bg-card"
            id="mobile-navigation"
          >
            <div className="flex h-[72px] items-center justify-between border-b border-structure px-lg">
              <Logo />
              <button
                aria-label="Close navigation menu"
                className="button-ghost h-[40px] w-[40px] px-0"
                onClick={() => setMobileNavigationOpen(false)}
                type="button"
              >
                <X aria-hidden={true} size={18} />
              </button>
            </div>

            {navigation(() => setMobileNavigationOpen(false))}
            {accountPanel}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:pl-sidebar">
        <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-structure bg-card px-md lg:hidden">
          <Logo />
          <button
            aria-controls="mobile-navigation"
            aria-expanded={mobileNavigationOpen}
            aria-label="Open navigation menu"
            className="button-ghost h-[40px] w-[40px] px-0"
            onClick={() => setMobileNavigationOpen(true)}
            type="button"
          >
            <Menu aria-hidden={true} size={18} />
          </button>
        </header>

        <div className="mx-auto max-w-content px-md py-lg sm:px-lg lg:px-xl lg:py-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
