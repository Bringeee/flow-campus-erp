import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/erp/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  COURSE_FOR,
  DEPARTMENTS,
  SUBJECTS_FOR,
  attendancePct,
  feeDue,
  gradeFor,
  inr,
  studentPercentage,
  type Department,
  type Student,
} from "@/lib/erp-data";

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [
      { title: "Students — CampusFlow ERP" },
      {
        name: "description",
        content: "Search, add, edit and remove student records with attendance, fees and results at a glance.",
      },
      { property: "og:title", content: "Students — CampusFlow ERP" },
      { property: "og:description", content: "Complete student directory for your college." },
    ],
  }),
  component: StudentsPage,
});

type FormState = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  semester: string;
  feeTotal: string;
  feePaid: string;
};

const emptyForm = (): FormState => ({
  id: "",
  name: "",
  email: "",
  phone: "",
  department: DEPARTMENTS[0],
  semester: "1",
  feeTotal: "85000",
  feePaid: "0",
});

function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent, user } = useErp();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const canEdit = user?.role === "admin";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        (dept === "all" || s.department === dept) &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q)),
    );
  }, [students, query, dept]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setForm({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      department: s.department,
      semester: String(s.semester),
      feeTotal: String(s.feeTotal),
      feePaid: String(s.feePaid),
    });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const base = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department,
      course: COURSE_FOR(form.department),
      semester: Number(form.semester),
      feeTotal: Number(form.feeTotal) || 0,
      feePaid: Number(form.feePaid) || 0,
    };
    if (editing) {
      updateStudent(editing.id, base);
      toast.success(`${base.name} updated`);
    } else {
      addStudent({
        ...base,
        id: `CF${2026100 + students.length}`,
        present: 0,
        totalClasses: 0,
        subjects: SUBJECTS_FOR(form.department).map((n) => ({ name: n, marks: 0 })),
      });
      toast.success(`${base.name} admitted`);
    }
    setOpen(false);
  }

  return (
    <AppShell title="Students" subtitle={`${filtered.length} of ${students.length} records`}>
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
            <SelectTrigger className="w-52">
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
          {canEdit && (
            <Button onClick={openAdd}>
              <Plus className="size-4" /> Add student
            </Button>
          )}
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
                <TableHead>Course</TableHead>
                <TableHead>Sem</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Result</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const att = attendancePct(s);
                const pct = studentPercentage(s);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell>{s.course}</TableCell>
                    <TableCell>{s.semester}</TableCell>
                    <TableCell>
                      <Badge variant={att < 75 ? "destructive" : "secondary"}>{att}%</Badge>
                    </TableCell>
                    <TableCell>
                      {feeDue(s) === 0 ? (
                        <Badge variant="secondary">Paid</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">{inr(feeDue(s))} due</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pct}% · {gradeFor(pct)}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => {
                            deleteStudent(s.id);
                            toast.success(`${s.name} removed`);
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No students match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Department">
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v as Department })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Semester">
              <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Semester {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Total fee (₹)">
              <Input
                type="number"
                value={form.feeTotal}
                onChange={(e) => setForm({ ...form, feeTotal: e.target.value })}
              />
            </Field>
            <Field label="Fee paid (₹)">
              <Input
                type="number"
                value={form.feePaid}
                onChange={(e) => setForm({ ...form, feePaid: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
