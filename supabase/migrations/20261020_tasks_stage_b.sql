-- Tasks, stage B: time tracking, recurring templates and reminders.

-- A reminder fires before the due date ("due Thursday, remind me tomorrow").
-- reminded_at is stamped once sent so the daily job never repeats itself.
alter table public.tasks
  add column if not exists remind_at   timestamptz,
  add column if not exists reminded_at timestamptz;

create index if not exists tasks_remind_idx on public.tasks (remind_at)
  where remind_at is not null and reminded_at is null;

-- One row per stretch of work. Unlike ops-hub (which tracks time per client)
-- this hangs off the task, so estimated-vs-actual is answerable per task.
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task_id uuid references public.tasks(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  entry_date date not null default current_date,
  start_time time,
  end_time time,
  minutes integer not null check (minutes > 0),
  source text not null default 'manual' check (source in ('manual', 'timer')),
  note text
);

create index if not exists time_entries_task_idx     on public.time_entries (task_id);
create index if not exists time_entries_employee_idx on public.time_entries (employee_id);
create index if not exists time_entries_date_idx     on public.time_entries (entry_date);

-- A daily job turns each due template into a real task, then stamps
-- last_run_date so the same template cannot fire twice in one day.
create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  notes text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  day_of_week smallint check (day_of_week between 0 and 6),   -- weekly: 0 = Sunday
  day_of_month smallint check (day_of_month between 1 and 28), -- monthly, 28 to exist in every month
  assignee_id uuid references public.employees(id) on delete set null,
  assign_all boolean not null default false,
  active boolean not null default true,
  last_run_date date
);

alter table public.time_entries   enable row level security;
alter table public.task_templates enable row level security;

do $$
declare t text;
begin
  foreach t in array array['time_entries', 'task_templates'] loop
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

alter table public.time_entries   replica identity full;
alter table public.task_templates replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table public.time_entries;   exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.task_templates; exception when duplicate_object then null; end;
end $$;

-- Creates a task from every active template that is due today and has not
-- already run today. Called by the daily cron; safe to run more than once.
create or replace function public.run_due_task_templates()
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  tpl record;
  made integer := 0;
begin
  for tpl in
    select * from public.task_templates
    where active
      and (last_run_date is null or last_run_date < current_date)
      and (
        frequency = 'daily'
        or (frequency = 'weekly'  and day_of_week  = extract(dow  from current_date))
        or (frequency = 'monthly' and day_of_month = extract(day  from current_date))
      )
  loop
    insert into public.tasks (title, notes, priority, due_date, assignee_id, assign_all)
    values (tpl.title, tpl.notes, tpl.priority, current_date, tpl.assignee_id, tpl.assign_all);

    update public.task_templates set last_run_date = current_date where id = tpl.id;
    made := made + 1;
  end loop;
  return made;
end $$;

revoke execute on function public.run_due_task_templates() from public, anon;
grant  execute on function public.run_due_task_templates() to authenticated;
