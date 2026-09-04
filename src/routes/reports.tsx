import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Printer,
  ShieldAlert,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useErp } from "@/lib/erp-store";
import { downloadCsv, printPdf } from "@/lib/export";
import {
  attendancePct,
  feeDue,
  feeStatus,
  gradeFor,
  isPass,
  studentPercentage,
  type Student,
} from "@/lib/erp-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — VTOP" },
      {
        name: "description",
        content:
          "Export student, attendance, fees and results data to Excel, or generate a printable PDF report.",
      },
      { property: "og:title", content: "Reports — VTOP" },
      { property: "og:description", content: "Excel and PDF exports for your whole campus." },
    ],
  }),
  component: ReportsPage,
});

type ReportData = { headers: string[]; rows: (string | number)[][] };

function studentsData(list: Student[]): ReportData {
  return {
    headers: ["ID", "Name", "Email", "Phone", "Department", "Course", "Semester"],
    rows: list.map((s) => [s.id, s.name, s.email, s.phone, s.department, s.course, s.semester]),
  };
}

function attendanceData(list: Student[]): ReportData {
  return {
    headers: [
      "ID",
      "Name",
      "Department",
      "Semester",
      "Classes",
      "Present",
      "Attendance %",
      "Status",
    ],
    rows: list.map((s) => {
      const pct = attendancePct(s);
      return [
        s.id,
        s.name,
        s.department,
        s.semester,
        s.totalClasses,
        s.present,
        pct,
        pct < 75 ? "Below 75%" : "Eligible",
      ];
    }),
  };
}

function feesData(list: Student[]): ReportData {
  return {
    headers: [
      "ID",
      "Name",
      "Department",
      "Semester",
      "Total fee (₹)",
      "Paid (₹)",
      "Remaining (₹)",
      "Status",
    ],
    rows: list.map((s) => [
      s.id,
      s.name,
      s.department,
      s.semester,
      s.feeTotal,
      s.feePaid,
      feeDue(s),
      feeStatus(s),
    ]),
  };
}

function resultsData(list: Student[]): ReportData {
  return {
    headers: ["ID", "Name", "Department", "Semester", "Percentage", "Grade", "Result"],
    rows: list.map((s) => {
      const pct = studentPercentage(s);
      return [
        s.id,
        s.name,
        s.department,
        s.semester,
        pct,
        gradeFor(pct),
        isPass(s) ? "Pass" : "Fail",
      ];
    }),
  };
}

function ReportsPage() {
  const { students, user } = useErp();

  if (user?.role !== "admin") {
    return (
      <AppShell title="Reports">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-destructive/15 text-destructive">
              <ShieldAlert className="size-6" />
            </span>
            <p className="text-lg font-semibold">Admin access only</p>
            <p className="text-sm text-muted-foreground">
              Reports are restricted to admins. Please sign in with an admin account to export data.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const reports = [
    {
      id: "students",
      title: "Students",
      description: "ID, name, contact, department, course and semester for every student.",
      icon: Users,
      data: studentsData(students),
    },
    {
      id: "attendance",
      title: "Attendance",
      description: "Classes conducted, days present, attendance percentage and eligibility.",
      icon: CalendarClock,
      data: attendanceData(students),
    },
    {
      id: "fees",
      title: "Fees",
      description: "Total fee, paid, remaining and Paid/Pending status for every student.",
      icon: FileText,
      data: feesData(students),
    },
    {
      id: "results",
      title: "Results",
      description: "Subject-wise summary — percentage, grade and Pass/Fail for every student.",
      icon: GraduationCap,
      data: resultsData(students),
    },
  ] as const;

  return (
    <AppShell
      title="Reports"
      subtitle="Export student, attendance, fees and results to Excel, or print a PDF report"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <ReportCard
            key={r.id}
            id={r.id}
            title={r.title}
            description={r.description}
            icon={r.icon}
            data={r.data}
          />
        ))}
      </div>
    </AppShell>
  );
}

function ReportCard({
  id,
  title,
  description,
  icon: Icon,
  data,
}: {
  id: string;
  title: string;
  description: string;
  icon: typeof Users;
  data: ReportData;
}) {
  const date = new Date();
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
          <Icon className="size-5 text-primary" />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.rows.length} records · {data.headers.length} fields
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => downloadCsv(`${id}-report-${stamp}.csv`, [data.headers, ...data.rows])}
          >
            <FileSpreadsheet className="size-4" /> Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => printPdf(`${title} Report`, data.headers, data.rows)}
          >
            <Printer className="size-4" /> PDF report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
