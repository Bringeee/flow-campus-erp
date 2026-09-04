import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { CalendarCheck, IndianRupee, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useErp } from "@/lib/erp-store";
import {
  DEPARTMENTS,
  attendancePct,
  feeDue,
  gradeFor,
  inr,
  isPass,
  studentPercentage,
} from "@/lib/erp-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CampusFlow ERP" },
      {
        name: "description",
        content: "College dashboard with student count, attendance, pending fees and pass percentage.",
      },
      { property: "og:title", content: "Dashboard — CampusFlow ERP" },
      { property: "og:description", content: "Live college metrics across attendance, fees and results." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
  "var(--destructive)",
];

function DashboardPage() {
  const { students, user } = useErp();

  const stats = useMemo(() => {
    const n = students.length || 1;
    const avgAtt = students.reduce((a, s) => a + attendancePct(s), 0) / n;
    const pending = students.reduce((a, s) => a + feeDue(s), 0);
    const passPct = (students.filter(isPass).length / n) * 100;
    return {
      total: students.length,
      avgAtt: Math.round(avgAtt * 10) / 10,
      pending,
      passPct: Math.round(passPct * 10) / 10,
      lowAttendance: students.filter((s) => attendancePct(s) < 75).length,
    };
  }, [students]);

  const attendanceByDept = useMemo(
    () =>
      DEPARTMENTS.map((d) => {
        const list = students.filter((s) => s.department === d);
        const avg = list.length ? list.reduce((a, s) => a + attendancePct(s), 0) / list.length : 0;
        return { department: d.split(" ")[0], attendance: Math.round(avg * 10) / 10 };
      }),
    [students],
  );

  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const g = gradeFor(studentPercentage(s));
      counts[g] = (counts[g] ?? 0) + 1;
    });
    return ["A+", "A", "B", "C", "D", "E", "F"]
      .filter((g) => counts[g])
      .map((g) => ({ grade: g, count: counts[g]! }));
  }, [students]);

  const isStudent = user?.role === "student";
  const me = isStudent ? students.find((s) => s.id === user?.studentId) : undefined;

  if (isStudent && me) {
    const pct = studentPercentage(me);
    return (
      <AppShell title={`Welcome, ${me.name}`} subtitle={`${me.course} · Semester ${me.semester} · ${me.id}`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Attendance" value={`${attendancePct(me)}%`} icon={CalendarCheck} tone={attendancePct(me) < 75 ? "danger" : "success"} />
          <StatCard label="Fees Paid" value={inr(me.feePaid)} icon={IndianRupee} hint={`${inr(feeDue(me))} due`} />
          <StatCard label="Percentage" value={`${pct}%`} icon={TrendingUp} hint={`Grade ${gradeFor(pct)}`} />
          <StatCard label="Status" value={isPass(me) ? "Pass" : "Fail"} icon={Users} tone={isPass(me) ? "success" : "danger"} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Subject performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {me.subjects.map((sub) => (
              <div key={sub.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{sub.name}</span>
                  <span className="text-muted-foreground">
                    {sub.marks}/100 · {gradeFor(sub.marks)}
                  </span>
                </div>
                <Progress value={sub.marks} />
              </div>
            ))}
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={user?.role === "faculty" ? "Faculty Dashboard" : "Admin Dashboard"}
      subtitle="One Campus. One System. Complete Control."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={String(stats.total)} icon={Users} hint="Across 4 departments" />
        <StatCard
          label="Average Attendance"
          value={`${stats.avgAtt}%`}
          icon={CalendarCheck}
          hint={`${stats.lowAttendance} below 75%`}
          tone={stats.avgAtt < 75 ? "danger" : "success"}
        />
        <StatCard label="Pending Fees" value={inr(stats.pending)} icon={IndianRupee} tone="warning" />
        <StatCard label="Pass Percentage" value={`${stats.passPct}%`} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance overview</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="department" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Bar dataKey="attendance" fill="var(--chart-1)" radius={[8, 8, 0, 0]} name="Avg attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeDistribution} dataKey="count" nameKey="grade" innerRadius={55} outerRadius={95}>
                  {gradeDistribution.map((entry, i) => (
                    <Cell key={entry.grade} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students needing attention (attendance below 75%)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {students
            .filter((s) => attendancePct(s) < 75)
            .slice(0, 12)
            .map((s) => (
              <Badge key={s.id} variant="destructive">
                {s.name} · {attendancePct(s)}%
              </Badge>
            ))}
          {stats.lowAttendance === 0 && (
            <p className="text-sm text-muted-foreground">All students are above 75% attendance.</p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: typeof Users;
  hint?: string;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-destructive"
        : tone === "warning"
          ? "text-warning"
          : "text-primary";
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
          <Icon className={`size-5 ${toneClass}`} />
        </span>
      </CardContent>
    </Card>
  );
}
