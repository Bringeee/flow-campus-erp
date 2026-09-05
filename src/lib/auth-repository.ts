import { isSupabaseConfigured, supabase } from "./supabase";
import type { Role } from "./erp-data";

export type AuthenticatedProfile = {
  role: Role;
  studentId?: string;
};

export async function signInWithSupabase(
  email: string,
  password: string,
  expectedRole: Role,
): Promise<AuthenticatedProfile> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) throw authError;

  const { data, error: profileError } = await supabase
    .from("user_profiles")
    .select("role, student_id")
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error("Create a user_profiles row for this Supabase Auth user first.");
  }

  const profile = data as { role: Role; student_id: string | null };
  if (profile.role !== expectedRole) {
    await supabase.auth.signOut();
    throw new Error(`This account is configured as ${profile.role}, not ${expectedRole}.`);
  }

  return {
    role: profile.role,
    ...(profile.student_id ? { studentId: profile.student_id } : {}),
  };
}
