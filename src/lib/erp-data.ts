export type Role = "admin" | "faculty" | "student";

export type Subject = { name: string; marks: number };

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  course: string;
  semester: number;
  present: number;
  totalClasses: number;
  feeTotal: number;
  feePaid: number;
  subjects: Subject[];
};

export type Faculty = {
  id: string;
  name: string;
  email: string;
  department: Department;
  subject: string;
};

export const DEPARTMENTS = [
  "Computer Science",
  "Mechanical",
  "Electronics",
  "Commerce",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

const COURSE_BY_DEPT: Record<Department, string> = {
  "Computer Science": "B.Tech CSE",
  Mechanical: "B.Tech ME",
  Electronics: "B.Tech ECE",
  Commerce: "B.Com (Hons)",
};

const SUBJECTS_BY_DEPT: Record<Department, string[]> = {
  "Computer Science": ["Data Structures", "DBMS", "Operating Systems", "Mathematics III", "Web Technologies"],
  Mechanical: ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Mathematics III", "Manufacturing"],
  Electronics: ["Digital Circuits", "Signals & Systems", "Microprocessors", "Mathematics III", "Communication"],
  Commerce: ["Financial Accounting", "Business Law", "Economics", "Statistics", "Taxation"],
};

const FIRST = [
  "Aarav","Vivaan","Aditya","Ishaan","Kabir","Rohan","Arjun","Karthik","Rahul","Siddharth",
  "Ananya","Diya","Isha","Meera","Priya","Sneha","Kavya","Riya","Nisha","Pooja",
  "Manish","Nikhil","Varun","Yash","Harsh","Tanvi","Shreya","Neha","Divya","Aisha",
];
const LAST = [
  "Sharma","Verma","Patel","Reddy","Nair","Iyer","Gupta","Singh","Chauhan","Joshi",
  "Mehta","Desai","Kulkarni","Rao","Bose","Chopra","Malhotra","Pillai","Banerjee","Kaur",
];

/** Deterministic PRNG so server and client render identical data. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function gradeFor(pct: number): string {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  if (pct >= 40) return "E";
  return "F";
}

export function studentPercentage(s: Student): number {
  if (!s.subjects.length) return 0;
  const total = s.subjects.reduce((a, b) => a + b.marks, 0);
  return Math.round((total / (s.subjects.length * 100)) * 1000) / 10;
}

export function attendancePct(s: Student): number {
  if (!s.totalClasses) return 0;
  return Math.round((s.present / s.totalClasses) * 1000) / 10;
}

export function feeDue(s: Student): number {
  return Math.max(0, s.feeTotal - s.feePaid);
}

export function isPass(s: Student): boolean {
  return s.subjects.length > 0 && s.subjects.every((x) => x.marks >= 40);
}

export function generateStudents(): Student[] {
  const rand = makeRandom(20260904);
  const students: Student[] = [];
  for (let i = 0; i < 50; i++) {
    const department = DEPARTMENTS[i % DEPARTMENTS.length]!;
    const name = `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`;
    const semester = 1 + Math.floor(rand() * 6);
    const totalClasses = 60 + Math.floor(rand() * 20);
    const present = Math.round(totalClasses * (0.6 + rand() * 0.4));
    const feeTotal = [65000, 78000, 85000, 92000][Math.floor(rand() * 4)]!;
    const paidRatio = [0, 0.5, 0.75, 1, 1][Math.floor(rand() * 5)]!;
    const subjects = SUBJECTS_BY_DEPT[department].map((sn) => ({
      name: sn,
      marks: Math.min(100, Math.round(35 + rand() * 62)),
    }));
    students.push({
      id: `CF${String(2026000 + i + 1)}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}${i}@campusflow.edu.in`,
      phone: `+91 9${String(Math.floor(rand() * 900000000) + 100000000)}`,
      department,
      course: COURSE_BY_DEPT[department],
      semester,
      present,
      totalClasses,
      feeTotal,
      feePaid: Math.round(feeTotal * paidRatio),
      subjects,
    });
  }
  return students;
}

export const FACULTY: Faculty[] = [
  { id: "FAC01", name: "Dr. Ramesh Iyer", email: "ramesh.iyer@campusflow.edu.in", department: "Computer Science", subject: "Data Structures" },
  { id: "FAC02", name: "Prof. Sunita Deshmukh", email: "sunita.d@campusflow.edu.in", department: "Mechanical", subject: "Thermodynamics" },
  { id: "FAC03", name: "Dr. Anil Kapoor", email: "anil.kapoor@campusflow.edu.in", department: "Electronics", subject: "Microprocessors" },
  { id: "FAC04", name: "Prof. Meenakshi Rao", email: "meenakshi.rao@campusflow.edu.in", department: "Commerce", subject: "Taxation" },
  { id: "FAC05", name: "Dr. Vikram Bhatt", email: "vikram.bhatt@campusflow.edu.in", department: "Computer Science", subject: "DBMS" },
];

export const SUBJECTS_FOR = (d: Department) => SUBJECTS_BY_DEPT[d];
export const COURSE_FOR = (d: Department) => COURSE_BY_DEPT[d];

export function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
