-- Cache e registro das buscas web usadas pela Comparação.
create table public.web_searches (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  query_slug text not null,
  results jsonb not null default '[]'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index web_searches_slug_created_idx
  on public.web_searches (query_slug, created_at desc);

create index web_searches_ip_created_idx
  on public.web_searches (ip_hash, created_at desc);

create index web_searches_created_idx
  on public.web_searches (created_at desc);

alter table public.web_searches enable row level security;
revoke all on table public.web_searches from anon, authenticated;
