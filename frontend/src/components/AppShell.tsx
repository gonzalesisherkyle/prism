import { FolderGit2, LayoutDashboard, Menu, MessagesSquare, Search, Settings, X } from "lucide-react";
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
  { label: "Search", to: "/search", icon: Search },
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
    <nav aria-label="Application sections" className="grid gap-sm px-md py-xl">
      {navigationItems.map(({ icon: Icon, ...item }) => (
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-md border-l-4 px-md py-sm text-body-md rounded-none transition-all duration-300 ${
              isActive
                ? "border-primary bg-gradient-to-r from-primary/15 to-transparent text-on-surface shadow-sm shadow-primary/5 font-semibold"
                : "border-transparent text-secondary hover:text-on-surface hover:bg-white/5 hover:translate-x-[2px]"
            }`
          }
          end={item.end}
          key={item.label}
          onClick={onNavigate}
          to={item.to}
        >
          <Icon aria-hidden={true} className="shrink-0 transition-transform duration-300 group-hover:scale-110" size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const accountPanel = (
    <div className="mt-auto border-t border-structure p-lg bg-surface-container-low/20">
      <p className="label-caps mb-sm">SIGNED IN</p>
      <div className="flex items-center gap-md mb-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-gradient-to-br from-primary to-primary-container font-mono text-xs font-bold text-white shadow-md shadow-primary/20">
          {(user?.username ?? "G").substring(0, 2).toUpperCase()}
        </div>
        <p className="flex-1 truncate font-mono text-code-sm text-on-surface font-semibold">
          {user?.username ?? "GitHub User"}
        </p>
      </div>
      <button className="button-ghost w-full" onClick={handleLogout} type="button">
        Logout
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col border-r border-structure bg-card/90 backdrop-blur-md lg:flex">
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
            className="absolute inset-0 border-0 bg-surface/40 backdrop-blur-sm"
            onClick={() => setMobileNavigationOpen(false)}
            type="button"
          />

          <aside
            aria-label="Mobile navigation"
            className="relative flex h-full w-sidebar max-w-[calc(100%-40px)] flex-col border-r border-structure bg-card/95 backdrop-blur-lg"
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
        <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-structure bg-card/85 backdrop-blur-md px-md lg:hidden">
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
