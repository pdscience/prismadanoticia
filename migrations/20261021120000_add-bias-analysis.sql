create table public.bias_analyses (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null unique references public.news(id) on delete cascade,
  text_label text not null check (
    text_label in ('esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita', 'mista')
  ),
  economic_axis integer not null check (economic_axis between -100 and 100),
  social_axis integer not null check (social_axis between -100 and 100),
  overall_score integer not null check (overall_score between -100 and 100),
  confidence integer not null check (confidence between 0 and 100),
  outlet_estimate_label text check (
    outlet_estimate_label in ('esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita', 'mista')
  ),
  outlet_estimate_confidence integer check (outlet_estimate_confidence between 0 and 100),
  distortion_risk integer not null check (distortion_risk between 0 and 100),
  favored_side text not null default 'incerto' check (
    favored_side in ('esquerda', 'direita', 'centro', 'nenhum', 'incerto')
  ),
  summary text not null,
  signals jsonb not null default '[]'::jsonb check (jsonb_typeof(signals) = 'array'),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  methodology_version text not null default 'v1',
  model text not null,
  created_at timestamptz not null default now()
);

create table public.source_bias_profiles (
  source_id uuid primary key references public.sources(id) on delete cascade,
  label text not null check (
    label in ('esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita', 'mista')
  ),
  economic_axis integer not null check (economic_axis between -100 and 100),
  social_axis integer not null check (social_axis between -100 and 100),
  confidence integer not null check (confidence between 0 and 100),
  methodology text not null,
  reference_url text,
  reviewed_at timestamptz not null default now(),
  reviewer text,
  created_at timestamptz not null default now()
);

create table public.bias_requests (
  id uuid primary key default gen_random_uuid(),
  ip_hash text,
  url text not null,
  created_at timestamptz not null default now()
);

create index bias_requests_ip_created_idx
  on public.bias_requests (ip_hash, created_at desc);

create index bias_requests_created_idx
  on public.bias_requests (created_at desc);

create index bias_analyses_created_idx
  on public.bias_analyses (created_at desc);

create view public.bias_feed
with (security_invoker = true)
as
select
  b.id,
  b.news_id,
  n.url,
  n.title,
  n.author,
  n.published_at,
  s.name as outlet,
  s.slug as source_slug,
  t.label as topic,
  t.slug as topic_slug,
  b.text_label,
  b.economic_axis,
  b.social_axis,
  b.overall_score,
  b.confidence,
  b.outlet_estimate_label,
  b.outlet_estimate_confidence,
  b.distortion_risk,
  b.favored_side,
  b.summary,
  b.signals,
  b.evidence,
  p.label as curated_label,
  p.economic_axis as curated_economic_axis,
  p.social_axis as curated_social_axis,
  p.confidence as curated_confidence,
  p.methodology as curated_methodology,
  p.reference_url as curated_reference_url,
  p.reviewed_at as curated_reviewed_at,
  b.methodology_version,
  b.model,
  b.created_at
from public.bias_analyses b
join public.news n on n.id = b.news_id
join public.sources s on s.id = n.source_id
left join public.topics t on t.id = n.topic_id
left join public.source_bias_profiles p on p.source_id = n.source_id;

alter table public.bias_analyses enable row level security;
alter table public.source_bias_profiles enable row level security;

create policy "public read" on public.bias_analyses
for select to anon, authenticated using (true);

create policy "public read" on public.source_bias_profiles
for select to anon, authenticated using (true);

revoke all on public.bias_analyses from anon, authenticated;
revoke all on public.source_bias_profiles from anon, authenticated;
grant select on public.bias_analyses to anon, authenticated;
grant select on public.source_bias_profiles to anon, authenticated;
grant select on public.bias_feed to anon, authenticated;

alter table public.bias_requests enable row level security;
revoke all on table public.bias_requests from anon, authenticated;

insert into public.bias_analyses (
  news_id,
  text_label,
  economic_axis,
  social_axis,
  overall_score,
  confidence,
  outlet_estimate_label,
  outlet_estimate_confidence,
  distortion_risk,
  favored_side,
  summary,
  signals,
  evidence,
  methodology_version,
  model
)
select
  n.id,
  'centro',
  -8,
  4,
  -2,
  58,
  'centro',
  38,
  24,
  'nenhum',
  'O texto descreve o relatório com dados e declarações de setores distintos. Há poucos sinais de enquadramento valorativo, embora a manchete destaque a entrega do texto sem explicitar os pontos ainda em disputa.',
  '[
    {
      "type": "headline_body_gap",
      "strength": "fraca",
      "quote": "Relator entrega texto da reforma tributária com mudanças no imposto sobre consumo",
      "explanation": "A manchete enfatiza a entrega do relatório, enquanto o corpo detalha divergências que ainda podem alterar o texto.",
      "favored_side": "incerto"
    },
    {
      "type": "missing_context",
      "strength": "fraca",
      "quote": "O texto ainda depende de votação nas comissões",
      "explanation": "O trecho informa a tramitação, mas não dimensiona quem são os principais opositores e quais pontos seguem abertos.",
      "favored_side": "nenhum"
    }
  ]'::jsonb,
  '[
    {
      "axis": "economic",
      "quote": "Setores de serviços afirmam que a alíquota efetiva sobe, enquanto a indústria comemora a simplificação de tributos em cascata.",
      "explanation": "O texto contrapõe dois setores econômicos sem adotar a posição de um deles."
    },
    {
      "axis": "social",
      "quote": "O relatório apresentado nesta semana altera as regras de transição do imposto sobre consumo",
      "explanation": "A descrição prioriza o desenho tributário e não apresenta uma leitura social explícita."
    },
    {
      "axis": "economic",
      "quote": "cria uma trava de arrecadação para estados",
      "explanation": "A expressão descreve um mecanismo fiscal sem juízo de valor."
    }
  ]'::jsonb,
  'v1',
  'fixture'
from public.news n
where n.url = 'https://exemplo.com.br/politica/reforma-tributaria-relatorio'
on conflict (news_id) do update set
  text_label = excluded.text_label,
  economic_axis = excluded.economic_axis,
  social_axis = excluded.social_axis,
  overall_score = excluded.overall_score,
  confidence = excluded.confidence,
  outlet_estimate_label = excluded.outlet_estimate_label,
  outlet_estimate_confidence = excluded.outlet_estimate_confidence,
  distortion_risk = excluded.distortion_risk,
  favored_side = excluded.favored_side,
  summary = excluded.summary,
  signals = excluded.signals,
  evidence = excluded.evidence,
  methodology_version = excluded.methodology_version,
  model = excluded.model;
