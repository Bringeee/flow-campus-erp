import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, ShieldCheck, BookOpen, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useErp } from "@/lib/erp-store";
import { findStudentByLoginEmail, type Role } from "@/lib/erp-data";
import { signInWithSupabase } from "@/lib/auth-repository";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — VTOP" },
      {
        name: "description",
        content:
          "Sign in to VTOP to manage students, attendance, fees and results in one college system.",
      },
      { property: "og:title", content: "Sign in — VTOP" },
      {
        property: "og:description",
        content: "VIT On Top. Complete Control.",
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
    // Students log in with <id>@np.in and their own ID as password — validated against records.
    credentials: [],
  },
];

function LoginPage() {
  const { login, students } = useErp();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function signIn(r: Role, enteredEmail?: string) {
    login(r, enteredEmail);
    const d = DEMOS.find((x) => x.role === r);
    toast.success(`Signed in as ${d?.label ?? r}`);
    navigate({ to: "/dashboard" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    if (!email.trim() || !password) {
      toast.error("Enter your email and password");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        await signInWithSupabase(normalizedEmail, password, role);
        signIn(role, normalizedEmail);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to sign in");
      }
      return;
    }

    const selected = DEMOS.find((d) => d.role === role)!;
    const ok =
      role === "student"
        ? (() => {
            const s = findStudentByLoginEmail(students, normalizedEmail);
            return !!s && password === s.id;
          })()
        : selected.credentials.some((c) => normalizedEmail === c.email && password === c.password);
    if (!ok) toast.error("Invalid credentials for this account");
    else signIn(role, normalizedEmail);
  }

  function selectRole(r: Role) {
    setRole(r);
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex animate-in items-center gap-3 fade-in zoom-in-95 fill-mode-both duration-700 ease-out motion-reduce:animate-none">
          <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-lg font-semibold">VTOP</span>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <h2
            className="max-w-md animate-in text-4xl font-bold leading-tight tracking-tight fade-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out motion-reduce:animate-none"
            style={{ animationDelay: "150ms" }}
          >
            VIT On Top. Complete Control.
          </h2>
          <p
            className="mt-4 max-w-md animate-in text-sidebar-foreground/70 fade-in slide-in-from-bottom-2 fill-mode-both duration-700 ease-out motion-reduce:animate-none"
            style={{ animationDelay: "300ms" }}
          >
            Replace scattered Excel sheets with a single college system for student records,
            attendance, fees and results.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["50", "Students"],
              ["5", "Faculty"],
              ["4", "Departments"],
            ].map(([n, l], i) => (
              <div
                key={l}
                className="animate-in rounded-xl bg-sidebar-accent/60 p-4 fade-in slide-in-from-bottom-2 fill-mode-both duration-600 ease-out transition-all hover:-translate-y-1 hover:bg-sidebar-accent hover:shadow-lg motion-reduce:animate-none motion-reduce:transition-none"
                style={{ animationDelay: `${450 + i * 110}ms` }}
              >
                <p className="text-2xl font-semibold">{n}</p>
                <p className="text-xs text-sidebar-foreground/70">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="login-surface flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex animate-in items-center gap-3 fill-mode-both duration-500 fade-in slide-in-from-bottom-2 ease-out lg:hidden motion-reduce:animate-none">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-lg font-semibold">VTOP</span>
          </div>

          {role === null ? (
            <div
              key="choose"
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300 ease-out motion-reduce:animate-none"
              style={{ animationDelay: "250ms" }}
            >
              <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your authority to open the sign-in panel.
              </p>

              <div className="mt-8 grid gap-3">
                {DEMOS.map((d, i) => (
                  <Button
                    key={d.role}
                    variant="outline"
                    className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500 ease-out justify-start py-3 motion-reduce:animate-none"
                    style={{ animationDelay: `${500 + i * 100}ms` }}
                    onClick={() => selectRole(d.role)}
                  >
                    <d.icon className="size-4 text-primary" />
                    <span className="flex-1 text-left">{d.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="animate-in fade-in zoom-in-95 slide-in-from-bottom-2 space-y-5 duration-300 ease-out motion-reduce:animate-none"
            >
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Continue as {role}
                </Button>
                <Button type="button" variant="outline" onClick={() => setRole(null)}>
                  Cancel
                </Button>
              </div>

            </form>
          )}
        </div>
      </section>
    </div>
  );
}
