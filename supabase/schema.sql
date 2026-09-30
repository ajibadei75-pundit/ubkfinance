-- Already applied to the Supabase project (aufhvlhktvxxchheukly). Kept for reference / re-creation.
create table if not exists public.ubk_kv (key text primary key, value jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.ubk_private (name text primary key, value text not null);
alter table public.ubk_kv enable row level security;
alter table public.ubk_private enable row level security;
revoke all on public.ubk_kv, public.ubk_private from anon, authenticated;
-- functions ubk_get / ubk_set / ubk_del (security definer) check p_secret against ubk_private.rpc;
-- direct table access is denied to the public keys.
