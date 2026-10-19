-- Tasks, stage A: the board plus the employee list it assigns to.
-- Timer, recurring templates and email reminders come in stage B.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  -- Removing an employee archives them: their name must keep resolving in
  -- old tasks and reports, so rows are never actually deleted.
  archived_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  due_date date,
  due_time time,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  completed_at timestamptz,
  assignee_id uuid references public.employees(id) on delete set null,
  -- Optional: a task may belong to a specific bachur, or to the amuta at large.
  bachur_id text references public.bachurim(id) on delete set null
);

create index if not exists tasks_status_idx   on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_bachur_idx   on public.tasks (bachur_id);

-- Every note added to a task. new_due_date records a postponement, so the
-- history shows how often a task slipped and why.
create table if not exists public.task_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  content text not null,
  new_due_date date,
  author_email text
);

create index if not exists task_updates_task_idx on public.task_updates (task_id);

alter table public.employees    enable row level security;
alter table public.tasks        enable row level security;
alter table public.task_updates enable row level security;

do $$
declare t text;
begin
  foreach t in array array['employees', 'tasks', 'task_updates'] loop
    execute format('drop policy if exists "Approved read %1$s"   on public.%1$I', t);
    execute format('drop policy if exists "Approved insert %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Approved update %1$s" on public.%1$I', t);
    execute format('drop policy if exists "Approved delete %1$s" on public.%1$I', t);

    execute format('create policy "Approved read %1$s"   on public.%1$I for select to authenticated using (public.is_approved_user(auth.uid()))', t);
    execute format('create policy "Approved insert %1$s" on public.%1$I for insert to authenticated with check (public.is_approved_user(auth.uid()))', t);
    execute format('create policy "Approved update %1$s" on public.%1$I for update to authenticated using (public.is_approved_user(auth.uid())) with check (public.is_approved_user(auth.uid()))', t);
    execute format('create policy "Approved delete %1$s" on public.%1$I for delete to authenticated using (public.is_approved_user(auth.uid()))', t);
  end loop;
end $$;

alter table public.employees    replica identity full;
alter table public.tasks        replica identity full;
alter table public.task_updates replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table public.employees;    exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.tasks;        exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.task_updates; exception when duplicate_object then null; end;
end $$;
