-- A task can target the whole team rather than one person. assignee_id is a
-- foreign key so it cannot carry a sentinel value; a flag keeps both options
-- expressible without weakening the reference.
alter table public.tasks
  add column if not exists assign_all boolean not null default false;
