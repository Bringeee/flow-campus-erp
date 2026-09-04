import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { cn } from "@/lib/utils";
import {
  DEPARTMENTS,
  gradeFor,
  isPass,
  studentPercentage,
  type Student,
  type Subject,
} from "@/lib/erp-data";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — VTOP" },
      {
        name: "description",
        content:
          "View subject marks, auto-calculated grades, percentage and Pass/Fail for every student.",
      },
      { property: "og:title", content: "Results — VTOP" },
      {
        property: "og:description",
        content: "Subject marks, grade, percentage and Pass/Fail at a glance.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { students, user } = useErp();
  const me = students.find((s) => s.id === user?.studentId);

  if (user?.role === "student" && me) {
    return <StudentResults student={me} />;
  }

  return <AdminResults />;
}

function StudentResults({ student }: { student: Student }) {
  const pct = studentPercentage(student);
  const grade = gradeFor(pct);
  const pass = isPass(student);

  return (
    <AppShell
      title="My Results"
      subtitle={`${student.course} · Semester ${student.semester} · ${student.id}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultStat
          label="Percentage"
          value={`${pct}%`}
          icon={TrendingUp}
          tone={pass ? "success" : "danger"}
        />
        <ResultStat label="Grade" value={grade} icon={Award} />
        <ResultStat
          label="Status"
          value={pass ? "Pass" : "Fail"}
          icon={GraduationCap}
          tone={pass ? "success" : "danger"}
        />
        <ResultStat
          label="Subjects"
          value={`${student.subjects.filter((x) => x.marks >= 40).length}/${student.subjects.length}`}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Subject marks
            <PassFailBadge pass={pass} />
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <SubjectTable subjects={student.subjects} />
        </CardContent>
      </Card>
    </AppShell>
  );
}

function AdminResults() {
  const { students, user } = useErp();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");

  const scope = user?.departments;
  const visibleDepts = scope ?? DEPARTMENTS;
  const scopedStudents = scope ? students.filter((s) => scope.includes(s.department)) : students;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedStudents.filter(
      (s) =>
        (dept === "all" || s.department === dept) &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q)),
    );
  }, [scopedStudents, query, dept]);

  const stats = useMemo(() => {
    const scoped = scope ? scopedStudents : students;
    const n = scoped.length || 1;
    const passed = scoped.filter(isPass).length;
    const avgPct = scoped.reduce((a, s) => a + studentPercentage(s), 0) / n;
    return {
      avgPct: Math.round(avgPct * 10) / 10,
      passed,
      failed: scoped.length - passed,
      passPct: Math.round((passed / n) * 1000) / 10,
    };
  }, [scope, scopedStudents, students]);

  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <AppShell
      title="Results"
      subtitle={`${rows.length} of ${scopedStudents.length} students shown`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultStat label="Average %" value={`${stats.avgPct}%`} icon={TrendingUp} />
        <ResultStat
          label="Pass %"
          value={`${stats.passPct}%`}
          icon={GraduationCap}
          tone="success"
        />
        <ResultStat label="Passed" value={String(stats.passed)} icon={Award} tone="success" />
        <ResultStat
          label="Failed"
          value={String(stats.failed)}
          icon={X}
          tone={stats.failed > 0 ? "danger" : "success"}
        />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, ID or course"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {visibleDepts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const expanded = open[s.id] === true;
                return (
                  <ResultRow
                    key={s.id}
                    student={s}
                    expanded={expanded}
                    onToggle={() => setOpen({ ...open, [s.id]: !expanded })}
                  />
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No students match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function ResultRow({
  student,
  expanded,
  onToggle,
}: {
  student: Student;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = studentPercentage(student);
  const grade = gradeFor(pct);
  const pass = isPass(student);

  return (
    <>
      <TableRow className={pass ? undefined : "bg-destructive/5"}>
        <TableCell>
          <Button
            size="sm"
            variant="ghost"
            className="px-1.5"
            aria-label="Expand marks"
            onClick={onToggle}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-mono text-xs">{student.id}</TableCell>
        <TableCell className="font-medium">{student.name}</TableCell>
        <TableCell>{student.department}</TableCell>
        <TableCell>{student.semester}</TableCell>
        <TableCell className="text-right font-medium">{pct}%</TableCell>
        <TableCell>
          <GradeBadge grade={grade} />
        </TableCell>
        <TableCell>
          <PassFailBadge pass={pass} />
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={8} className="p-0">
            <SubjectTable subjects={student.subjects} compact />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
function SubjectTable({ subjects, compact = false }: { subjects: Subject[]; compact?: boolean }) {
  return (
    <Table className="mb-0">
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead className="text-right">Marks</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((x) => {
          const pass = x.marks >= 40;
          const grade = gradeFor(x.marks);
          return (
            <TableRow
              key={x.name}
              className={cn(compact ? "text-sm" : undefined, pass ? undefined : "bg-destructive/5")}
            >
              <TableCell>{x.name}</TableCell>
              <TableCell className="text-right font-medium">{x.marks}/100</TableCell>
              <TableCell>
                <GradeBadge grade={grade} />
              </TableCell>
              <TableCell>
                <PassFailBadge pass={pass} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const excellent = grade === "A" || grade === "A+";
  const good = grade === "B" || grade === "C";
  const fail = grade === "F";
  const cls = fail
    ? "bg-destructive/15 text-destructive"
    : good
      ? "bg-warning/15 text-warning"
      : excellent
        ? "bg-success/15 text-success"
        : "bg-secondary text-secondary-foreground";
  return (
    <Badge variant="secondary" className={cn("border-transparent", cls)}>
      {grade}
    </Badge>
  );
}

function PassFailBadge({ pass }: { pass: boolean }) {
  if (pass) {
    return (
      <Badge variant="secondary" className="border-transparent bg-success/15 text-success">
        Pass
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="border-transparent bg-destructive/15 text-destructive">
      Fail
    </Badge>
  );
}

function ResultStat({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: typeof Users;
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
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
          <Icon className={`size-5 ${toneClass}`} />
        </span>
      </CardContent>
    </Card>
  );
}
