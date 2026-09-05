import type { Student } from "./erp-data";

const STORAGE_KEY = "vtop-attendance-json";

type AttendanceSnapshot = Record<
  string,
  {
    present: number;
    totalClasses: number;
  }
>;

function readSnapshot(): AttendanceSnapshot {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AttendanceSnapshot) : {};
  } catch {
    return {};
  }
}

export function loadStudentsWithSavedAttendance(students: Student[]): Student[] {
  const snapshot = readSnapshot();
  return students.map((student) => {
    const saved = snapshot[student.id];
    return saved
      ? { ...student, present: saved.present, totalClasses: saved.totalClasses }
      : student;
  });
}

export function saveAttendanceSnapshot(students: Student[]): void {
  if (typeof window === "undefined") return;

  const snapshot: AttendanceSnapshot = Object.fromEntries(
    students.map((student) => [
      student.id,
      { present: student.present, totalClasses: student.totalClasses },
    ]),
  );

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
