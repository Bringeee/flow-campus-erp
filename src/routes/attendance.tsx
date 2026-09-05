import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { DEPARTMENTS, attendancePct } from "@/lib/erp-data";
import { saveAttendanceMarks } from "@/lib/attendance-repository";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — VTOP" },
      {
        name: "description",
        content:
          "Mark daily present/absent, auto-calculate attendance percentage and flag students below 75%.",
      },
      { property: "og:title", content: "Attendance — VTOP" },
      {
        property: "og:description",
        content: "Daily attendance marking with instant percentage calculation.",
      },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { students, user, markAttendance } = useErp();
  const scope = user?.departments;
  const visibleDepts = scope ?? DEPARTMENTS;
  const [dept, setDept] = useState<string>(visibleDepts[0]);
  const [query, setQuery] = useState("");
  const [marks, setMarks] = useState<Record<string, boolean>>({});

  const isStudent = user?.role === "student";
  const me = students.find((s) => s.id === user?.studentId);

  const scopedStudents = scope ? students.filter((s) => scope.includes(s.department)) : students;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedStudents.filter(
      (s) => s.department === dept && (!q || s.name.toLowerCase().includes(q)),
    );
  }, [scopedStudents, dept, query]);

  if (isStudent && me) {
    const pct = attendancePct(me);
    return (
      <AppShell title="My Attendance" subtitle={`${me.course} · Semester ${me.semester}`}>
        <Card>
          <CardHeader>
            <CardTitle>Overall attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold">{pct}%</span>
              <Badge variant={pct < 75 ? "destructive" : "secondary"}>
                {pct < 75 ? "Below 75% — shortage" : "Eligible"}
              </Badge>
            </div>
            <Progress value={pct} />
            <p className="text-sm text-muted-foreground">
              Present in {me.present} of {me.totalClasses} classes conducted.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const marked = Object.keys(marks).length;

  return (
    <AppShell title="Attendance" subtitle="Mark today's class and percentages update instantly">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibleDepts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="w-56"
            placeholder="Search student"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setMarks(Object.fromEntries(list.map((s) => [s.id, true])))}
          >
            Mark all present
          </Button>
          <Button
            className="ml-auto"
            disabled={marked === 0}
            onClick={async () => {
              const markList = Object.entries(marks).map(([studentId, present]) => ({
                studentId,
                present,
              }));
              markAttendance(marks);
              try {
                const result = await saveAttendanceMarks(markList);
                toast.success(
                  result.persisted
                    ? `Attendance saved for ${marked} student${marked === 1 ? "" : "s"}`
                    : "Attendance saved locally. Supabase auth is not connected yet.",
                );
              } catch {
                toast.error("Attendance saved locally, but Supabase could not be updated.");
              }
              setMarks({});
            }}
          >
            Save attendance ({marked})
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Attendance %</TableHead>
                <TableHead className="text-right">Today</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((s) => {
                const pct = attendancePct(s);
                const state = marks[s.id];
                return (
                  <TableRow key={s.id} className={pct < 75 ? "bg-destructive/5" : undefined}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.semester}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.present}/{s.totalClasses}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pct < 75 ? "destructive" : "secondary"}>{pct}%</Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        variant={state === true ? "default" : "outline"}
                        onClick={() => setMarks({ ...marks, [s.id]: true })}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={state === false ? "destructive" : "outline"}
                        onClick={() => setMarks({ ...marks, [s.id]: false })}
                      >
                        Absent
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
