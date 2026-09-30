-- Run once in Supabase: SQL Editor > New query > Run
create table if not exists public.ubk_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.ubk_kv enable row level security;
revoke all on public.ubk_kv from anon, authenticated;
-- No policies on purpose: only the server (service_role key) can read or write.
