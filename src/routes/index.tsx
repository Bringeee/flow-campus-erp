import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, ShieldCheck, BookOpen, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useErp } from "@/lib/erp-store";
import type { Role } from "@/lib/erp-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — CampusFlow ERP" },
      {
        name: "description",
        content:
          "Sign in to CampusFlow ERP to manage students, attendance, fees and results in one college system.",
      },
      { property: "og:title", content: "Sign in — CampusFlow ERP" },
      {
        property: "og:description",
        content: "One Campus. One System. Complete Control.",
      },
    ],
  }),
  component: LoginPage,
});

const DEMOS: { role: Role; label: string; icon: typeof ShieldCheck; email: string }[] = [
  { role: "admin", label: "Admin", icon: ShieldCheck, email: "admin@campusflow.edu.in" },
  { role: "faculty", label: "Faculty", icon: BookOpen, email: "ramesh.iyer@campusflow.edu.in" },
  { role: "student", label: "Student", icon: User, email: "student@campusflow.edu.in" },
];

function LoginPage() {
  const { login } = useErp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@campusflow.edu.in");
  const [password, setPassword] = useState("demo1234");

  function signIn(role: Role, label: string) {
    login(role);
    toast.success(`Signed in as ${label}`);
    navigate({ to: "/dashboard" });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    const match = DEMOS.find((d) => d.email === email.trim().toLowerCase());
    signIn(match?.role ?? "admin", match?.label ?? "Admin");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-lg font-semibold">CampusFlow ERP</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            One Campus. One System. Complete Control.
          </h2>
          <p className="mt-4 max-w-md text-sidebar-foreground/70">
            Replace scattered Excel sheets with a single college system for student records,
            attendance, fees and results.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["50", "Students"],
              ["5", "Faculty"],
              ["4", "Departments"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-sidebar-accent/60 p-4">
                <p className="text-2xl font-semibold">{n}</p>
                <p className="text-xs text-sidebar-foreground/70">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-sidebar-foreground/50">Demo data only — no real student records.</p>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-lg font-semibold">CampusFlow ERP</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a demo account to explore the ERP instantly.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> demo logins <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            {DEMOS.map((d) => (
              <Button
                key={d.role}
                variant="outline"
                className="justify-start"
                onClick={() => signIn(d.role, d.label)}
              >
                <d.icon className="size-4 text-primary" /> Continue as {d.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
