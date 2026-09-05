create table if not exists public.students (
  id text primary key,
  name text not null,
  email text not null unique,
  department text not null,
  course text not null,
  semester integer not null check (semester between 1 and 12),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references public.students(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null check (status in ('present', 'absent')),
  marked_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'faculty', 'student')),
  student_id text references public.students(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists attendance_records_student_date_idx
  on public.attendance_records (student_id, attendance_date desc);

alter table public.students enable row level security;
alter table public.attendance_records enable row level security;
alter table public.user_profiles enable row level security;

create or replace function public.has_staff_attendance_access()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and role in ('admin', 'faculty')
  );
$$;

create or replace function public.current_student_id()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select student_id from public.user_profiles where id = auth.uid();
$$;

drop policy if exists "authenticated users can read students" on public.students;
drop policy if exists "authenticated users can read attendance" on public.attendance_records;
drop policy if exists "authenticated users can mark attendance" on public.attendance_records;
drop policy if exists "authenticated users can update attendance" on public.attendance_records;

create policy "authenticated users can read students"
  on public.students for select
  to authenticated
  using (public.has_staff_attendance_access() or id = public.current_student_id());

create policy "authenticated users can read attendance"
  on public.attendance_records for select
  to authenticated
  using (public.has_staff_attendance_access() or student_id = public.current_student_id());

create policy "authenticated users can mark attendance"
  on public.attendance_records for insert
  to authenticated
  with check (public.has_staff_attendance_access() and marked_by = auth.uid());

create policy "authenticated users can update attendance"
  on public.attendance_records for update
  to authenticated
  using (public.has_staff_attendance_access())
  with check (public.has_staff_attendance_access() and marked_by = auth.uid());

create policy "users can read their own profile"
  on public.user_profiles for select
  to authenticated
  using (id = auth.uid());

create or replace function public.set_attendance_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists attendance_records_updated_at on public.attendance_records;
create trigger attendance_records_updated_at
before update on public.attendance_records
for each row execute function public.set_attendance_updated_at();
