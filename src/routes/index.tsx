import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, GraduationCap, ShieldCheck, BookOpen, User } from "lucide-react";
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

const DEMOS: {
  role: Role;
  label: string;
  icon: typeof ShieldCheck;
  credentials: { email: string; password: string }[];
}[] = [
  {
    role: "admin",
    label: "Admin",
    icon: ShieldCheck,
    credentials: [{ email: "admin@campusflow.edu.in", password: "null pointers" }],
  },
  {
    role: "faculty",
    label: "Faculty",
    icon: BookOpen,
    credentials: [
      { email: "ravisingh@np.in", password: "ravi.999" },
      { email: "nikunjrathi@np.in", password: "nikunj.111" },
    ],
  },
  {
    role: "student",
    label: "Student",
    icon: User,
    credentials: [{ email: "aarav.sharma@campusflow.edu.in", password: "student123" }],
  },
];

function LoginPage() {
  const { login } = useErp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function signIn(r: Role, enteredEmail?: string) {
    login(r, enteredEmail);
    const d = DEMOS.find((x) => x.role === r);
    toast.success(`Signed in as ${d?.label ?? r}`);
    navigate({ to: "/dashboard" });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    if (!email.trim() || !password) {
      toast.error("Enter your email and password");
      return;
    }
    const selected = DEMOS.find((d) => d.role === role)!;
    const ok = selected.credentials.some(
      (c) => email.trim().toLowerCase() === c.email && password === c.password,
    );
    if (!ok) {
      toast.error("Invalid credentials for this account");
      return;
    }
    signIn(role, email.trim());
  }

  function selectRole(r: Role) {
    setRole(r);
    setEmail("");
    setPassword("");
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
        <p className="text-xs text-sidebar-foreground/50">
          Demo data only — no real student records.
        </p>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-lg font-semibold">CampusFlow ERP</span>
          </div>

          {role === null ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your authority to open the sign-in panel.
              </p>

              <div className="mt-8 grid gap-3">
                {DEMOS.map((d) => (
                  <Button
                    key={d.role}
                    variant="outline"
                    className="justify-start py-3"
                    onClick={() => selectRole(d.role)}
                  >
                    <d.icon className="size-4 text-primary" />
                    <span className="flex-1 text-left">{d.label}</span>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <button
                type="button"
                onClick={() => setRole(null)}
                className="-ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> All sign-in options
              </button>

              {(() => {
                const d = DEMOS.find((x) => x.role === role)!;
                return (
                  <div className="mt-3 rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                        <d.icon className="size-5" />
                      </span>
                      <div>
                        <h1 className="text-lg font-semibold tracking-tight">{d.label} sign in</h1>
                        <p className="text-xs text-muted-foreground">
                          Enter your {d.label} account credentials.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Continue as {role}
                </Button>
                <Button type="button" variant="outline" onClick={() => setRole(null)}>
                  Cancel
                </Button>
              </div>

              {(() => {
                const d = DEMOS.find((x) => x.role === role)!;
                return (
                  <div className="text-xs text-muted-foreground">
                    {d.credentials.map((c) => (
                      <p key={c.email} className="leading-relaxed">
                        {c.email}
                        <br />
                        Password: {c.password}
                      </p>
                    ))}
                  </div>
                );
              })()}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
