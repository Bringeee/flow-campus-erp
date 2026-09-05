import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarCheck,
  FileSpreadsheet,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useErp } from "@/lib/erp-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "faculty", "student"] },
  { to: "/students", label: "Students", icon: Users, roles: ["admin", "faculty"] },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "faculty", "student"] },
  { to: "/fees", label: "Fees", icon: IndianRupee, roles: ["admin", "student"] },
  { to: "/results", label: "Results", icon: BarChart3, roles: ["admin", "faculty", "student"] },
  { to: "/reports", label: "Reports", icon: FileSpreadsheet, roles: ["admin"] },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { user, logout } = useErp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <GraduationCap className="size-10 text-primary" />
        <p className="text-muted-foreground">Please sign in to access VTOP.</p>
        <Button onClick={() => navigate({ to: "/" })}>Go to login</Button>
      </div>
    );
  }

  const items = NAV.filter((n) => (n.roles as readonly string[]).includes(user.role));

  return (
    <div className="app-surface flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <span className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">VTOP</p>
            <p className="text-[11px] text-sidebar-foreground/60">VIT On Top</p>
          </div>
          <button className="ml-auto" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="mb-3 text-xs capitalize text-sidebar-foreground/60">{user.role}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-sidebar-border bg-transparent hover:bg-sidebar-accent"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/40" onClick={() => setOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-transparent px-4 py-4 sm:px-6">
          <button
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-border/70 bg-background/60 transition-colors hover:bg-accent"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </header>
        <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
