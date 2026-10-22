-- Views de leitura pública para a landing:
--   trend_feed — cobertura real por tema na janela de 7 dias
--   stats_feed — contagem real de veículos, análises e temas
-- Ambas ignoram o veículo de demonstração ("veiculo-de-exemplo").

create index if not exists news_published_at_idx
on public.news (published_at desc);

create index if not exists news_created_at_idx
on public.news (created_at desc);

create or replace view public.trend_feed
with (security_invoker = true)
as
with current_window as (
  select
    n.topic_id,
    count(distinct n.source_id)::integer as outlets,
    count(*)::integer as articles
  from public.analyses a
  join public.news n on n.id = a.news_id
  join public.sources s on s.id = n.source_id
  where n.topic_id is not null
    and s.slug <> 'veiculo-de-exemplo'
    and coalesce(n.published_at, n.created_at) >= now() - interval '7 days'
  group by n.topic_id
),
previous_window as (
  select
    n.topic_id,
    count(distinct n.source_id)::integer as outlets
  from public.analyses a
  join public.news n on n.id = a.news_id
  join public.sources s on s.id = n.source_id
  where n.topic_id is not null
    and s.slug <> 'veiculo-de-exemplo'
    and coalesce(n.published_at, n.created_at) >= now() - interval '14 days'
    and coalesce(n.published_at, n.created_at) < now() - interval '7 days'
  group by n.topic_id
),
latest_headline as (
  select distinct on (n.topic_id)
    n.topic_id,
    n.title
  from public.analyses a
  join public.news n on n.id = a.news_id
  join public.sources s on s.id = n.source_id
  where n.topic_id is not null
    and s.slug <> 'veiculo-de-exemplo'
    and coalesce(n.published_at, n.created_at) >= now() - interval '7 days'
  order by n.topic_id, coalesce(n.published_at, n.created_at) desc
)
select
  t.slug as topic_slug,
  t.label,
  t.accent,
  t.frame_keys,
  coalesce(lh.title, t.headline) as headline,
  c.outlets,
  c.articles,
  case
    when coalesce(p.outlets, 0) = 0 then 0
    else round(((c.outlets - p.outlets)::numeric / p.outlets) * 100, 1)
  end as delta,
  coalesce(p.outlets, 0) > 0 as has_baseline
from current_window c
join public.topics t on t.id = c.topic_id
left join previous_window p on p.topic_id = c.topic_id
left join latest_headline lh on lh.topic_id = c.topic_id
order by c.articles desc, c.outlets desc;

grant select on public.trend_feed to anon, authenticated;

create or replace view public.stats_feed
with (security_invoker = true)
as
select
  (
    select count(distinct n.source_id)::integer
    from public.analyses a
    join public.news n on n.id = a.news_id
    join public.sources s on s.id = n.source_id
    where s.slug <> 'veiculo-de-exemplo'
  ) as outlets,
  (
    select count(*)::integer
    from public.analyses a
    join public.news n on n.id = a.news_id
    join public.sources s on s.id = n.source_id
    where s.slug <> 'veiculo-de-exemplo'
  ) as analyses,
  (
    select count(distinct n.topic_id)::integer
    from public.analyses a
    join public.news n on n.id = a.news_id
    join public.sources s on s.id = n.source_id
    where s.slug <> 'veiculo-de-exemplo'
      and n.topic_id is not null
  ) as topics;

grant select on public.stats_feed to anon, authenticated;
