import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  FACULTY,
  generateStudents,
  type Faculty,
  type Role,
  type Student,
} from "./erp-data";

export type SessionUser = {
  role: Role;
  name: string;
  email: string;
  studentId?: string;
};

type ErpContextValue = {
  user: SessionUser | null;
  login: (role: Role) => void;
  logout: () => void;
  students: Student[];
  faculty: Faculty[];
  addStudent: (s: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (marks: Record<string, boolean>) => void;
};

const ErpContext = createContext<ErpContextValue | null>(null);

export function ErpProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => generateStudents());
  const [user, setUser] = useState<SessionUser | null>(null);

  const value = useMemo<ErpContextValue>(
    () => ({
      user,
      students,
      faculty: FACULTY,
      login: (role) => {
        if (role === "admin") {
          setUser({ role, name: "Dr. Neelam Saxena", email: "admin@campusflow.edu.in" });
        } else if (role === "faculty") {
          setUser({ role, name: FACULTY[0]!.name, email: FACULTY[0]!.email });
        } else {
          const s = students[0]!;
          setUser({ role, name: s.name, email: s.email, studentId: s.id });
        }
      },
      logout: () => setUser(null),
      addStudent: (s) => setStudents((prev) => [s, ...prev]),
      updateStudent: (id, patch) =>
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      deleteStudent: (id) => setStudents((prev) => prev.filter((s) => s.id !== id)),
      markAttendance: (marks) =>
        setStudents((prev) =>
          prev.map((s) =>
            s.id in marks
              ? {
                  ...s,
                  totalClasses: s.totalClasses + 1,
                  present: s.present + (marks[s.id] ? 1 : 0),
                }
              : s,
          ),
        ),
    }),
    [user, students],
  );

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

export function useErp() {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error("useErp must be used inside ErpProvider");
  return ctx;
}
