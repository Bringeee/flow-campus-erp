import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, IndianRupee, PiggyBank, Search, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { DEPARTMENTS, feeDue, feeStatus, inr, type FeeStatus, type Student } from "@/lib/erp-data";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [
      { title: "Fees — VTOP" },
      {
        name: "description",
        content:
          "Track total fees, payments, remaining dues and Paid/Pending status for every student.",
      },
      { property: "og:title", content: "Fees — VTOP" },
      { property: "og:description", content: "Total fee, paid, remaining and status at a glance." },
    ],
  }),
  component: FeesPage,
});

function FeesPage() {
  const { students, user } = useErp();
  const me = students.find((s) => s.id === user?.studentId);

  if (user?.role === "student" && me) {
    return <StudentFees student={me} />;
  }

  return <AdminFees />;
}

function StudentFees({ student }: { student: Student }) {
  const status = feeStatus(student);
  const due = feeDue(student);
  const pct = student.feeTotal ? Math.round((student.feePaid / student.feeTotal) * 100) : 0;

  return (
    <AppShell
      title="My Fees"
      subtitle={`${student.course} · Semester ${student.semester} · ${student.id}`}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Fee summary
            <FeeStatusBadge status={status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <FeeBox label="Total fee" value={inr(student.feeTotal)} />
            <FeeBox
              label="Paid"
              value={inr(student.feePaid)}
              tone={status === "Paid" ? "success" : "default"}
            />
            <FeeBox label="Remaining" value={inr(due)} tone={due > 0 ? "warning" : "success"} />
          </div>
          <div className="space-y-2">
            <Progress value={pct} />
            <p className="text-sm text-muted-foreground">
              {pct}% of your total fee is paid.{" "}
              {due > 0 ? `${inr(due)} is due.` : "No dues remaining."}
            </p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function AdminFees() {
  const { students } = useErp();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        (dept === "all" || s.department === dept) &&
        (status === "all" || feeStatus(s) === status) &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q)),
    );
  }, [students, query, dept, status]);

  const totals = useMemo(() => {
    const totalFee = students.reduce((a, s) => a + s.feeTotal, 0);
    const paid = students.reduce((a, s) => a + s.feePaid, 0);
    return {
      totalFee,
      paid,
      remaining: totalFee - paid,
      pending: students.filter((s) => feeStatus(s) === "Pending").length,
    };
  }, [students]);

  return (
    <AppShell title="Fees" subtitle={`${rows.length} of ${students.length} students shown`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total fee" value={inr(totals.totalFee)} icon={IndianRupee} />
        <StatCard label="Collected" value={inr(totals.paid)} icon={Wallet} tone="success" />
        <StatCard
          label="Remaining"
          value={inr(totals.remaining)}
          icon={PiggyBank}
          tone={totals.remaining > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Pending students"
          value={String(totals.pending)}
          icon={Users}
          tone={totals.pending > 0 ? "danger" : "success"}
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
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Total fee</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <FeeRow key={s.id} student={s} />
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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

function FeeRow({ student }: { student: Student }) {
  const status = feeStatus(student);
  const due = feeDue(student);

  return (
    <TableRow className={status === "Pending" ? "bg-warning/5" : undefined}>
      <TableCell className="font-mono text-xs">{student.id}</TableCell>
      <TableCell className="font-medium">{student.name}</TableCell>
      <TableCell>{student.department}</TableCell>
      <TableCell className="text-right font-medium">{inr(student.feeTotal)}</TableCell>
      <TableCell className="text-right">{inr(student.feePaid)}</TableCell>
      <TableCell
        className={cn(
          "text-right font-medium",
          status === "Pending" ? "text-warning" : "text-muted-foreground",
        )}
      >
        {inr(due)}
      </TableCell>
      <TableCell>
        <FeeStatusBadge status={status} />
      </TableCell>
    </TableRow>
  );
}

function FeeStatusBadge({ status }: { status: FeeStatus }) {
  if (status === "Paid") {
    return (
      <Badge variant="secondary" className="gap-1 border-transparent bg-success/15 text-success">
        <CheckCircle2 className="size-3" /> Paid
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 border-transparent bg-warning/15 text-warning">
      <Clock className="size-3" /> Pending
    </Badge>
  );
}

function FeeBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tracking-tight", toneClass)}>{value}</p>
    </div>
  );
}

function StatCard({
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
