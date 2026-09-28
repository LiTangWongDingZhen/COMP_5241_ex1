-- Notely — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) to create the database.

create extension if not exists "pgcrypto";

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_updated_at_idx on public.notes (updated_at desc);

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row
  execute function public.set_updated_at();

-- Row Level Security: allow anon access (single-user local app).
-- For a multi-user deployment, add an `owner_id` column and restrict policies to auth.uid().
alter table public.notes enable row level security;

drop policy if exists "notes_select" on public.notes;
create policy "notes_select" on public.notes
  for select using (true);

drop policy if exists "notes_insert" on public.notes;
create policy "notes_insert" on public.notes
  for insert with check (true);

drop policy if exists "notes_update" on public.notes;
create policy "notes_update" on public.notes
  for update using (true);

drop policy if exists "notes_delete" on public.notes;
create policy "notes_delete" on public.notes
  for delete using (true);
