import { isSupabaseConfigured, supabase } from "./supabase";

export type AttendanceMark = {
  studentId: string;
  present: boolean;
};

export async function saveAttendanceMarks(
  marks: AttendanceMark[],
  attendanceDate = new Date().toISOString().slice(0, 10),
): Promise<{ persisted: boolean; reason?: "not-configured" | "not-authenticated" }> {
  if (!isSupabaseConfigured || !supabase || marks.length === 0) {
    return { persisted: false, reason: "not-configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { persisted: false, reason: "not-authenticated" };
  }

  const { error } = await supabase.from("attendance_records").upsert(
    marks.map((mark) => ({
      student_id: mark.studentId,
      attendance_date: attendanceDate,
      status: mark.present ? "present" : "absent",
      marked_by: user.id,
    })),
    { onConflict: "student_id,attendance_date" },
  );

  if (error) throw error;
  return { persisted: true };
}
