-- Registro pseudonimizado de chamadas para limitar custo da Edge Function.
create table public.analysis_requests (
  id uuid primary key default gen_random_uuid(),
  ip_hash text,
  url text not null,
  created_at timestamptz not null default now()
);

create index analysis_requests_ip_created_idx
  on public.analysis_requests (ip_hash, created_at desc);

create index analysis_requests_created_idx
  on public.analysis_requests (created_at desc);

alter table public.analysis_requests enable row level security;
revoke all on table public.analysis_requests from anon, authenticated;
