-- Invoices were only ever kept in the uploader's browser: the expenses table
-- had no columns for them and saveExpensesToDb dropped the fields silently.
-- Files now live in a private storage bucket; the row keeps only a pointer.

alter table public.expenses
  add column if not exists invoice_path text,
  add column if not exists invoice_name text,
  add column if not exists invoice_type text;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

drop policy if exists "Approved read invoices"   on storage.objects;
drop policy if exists "Approved upload invoices" on storage.objects;
drop policy if exists "Approved delete invoices" on storage.objects;

create policy "Approved read invoices" on storage.objects
  for select to authenticated
  using (bucket_id = 'invoices' and public.is_approved_user(auth.uid()));

create policy "Approved upload invoices" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'invoices' and public.is_approved_user(auth.uid()));

create policy "Approved delete invoices" on storage.objects
  for delete to authenticated
  using (bucket_id = 'invoices' and public.is_approved_user(auth.uid()));
