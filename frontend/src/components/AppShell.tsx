import { FolderGit2, LayoutDashboard, MessagesSquare, Settings } from "lucide-react";
import type { ComponentType } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col border-r border-structure bg-card lg:flex">
        <div className="flex h-[72px] items-center border-b border-structure px-lg">
          <Logo />
        </div>

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
              to={item.to}
            >
              <Icon aria-hidden={true} className="shrink-0" size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-structure p-lg">
          <p className="label-caps mb-sm">SIGNED IN</p>
          <p className="mb-md truncate font-mono text-code-sm text-secondary">
            {user?.username ?? "GitHub User"}
          </p>
          <button className="button-ghost w-full" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-sidebar">
        <div className="mx-auto max-w-content px-md py-lg sm:px-lg lg:px-xl lg:py-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

