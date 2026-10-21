create or replace view public.perspective_feed
with (security_invoker = true)
as
select
  b.id as bias_id,
  b.news_id,
  n.cluster_id,
  (
    select count(*)::integer
    from public.news cn
    where cn.cluster_id = n.cluster_id
  ) as cluster_size,
  n.url,
  n.title,
  n.published_at,
  s.name as outlet,
  s.slug as source_slug,
  s.scope,
  t.label as topic,
  t.slug as topic_slug,
  b.text_label,
  b.confidence,
  b.overall_score,
  b.outlet_estimate_label,
  b.outlet_estimate_confidence,
  p.label as curated_label,
  p.confidence as curated_confidence,
  b.created_at
from public.bias_analyses b
join public.news n on n.id = b.news_id
join public.sources s on s.id = n.source_id
left join public.topics t on t.id = n.topic_id
left join public.source_bias_profiles p on p.source_id = n.source_id
where n.cluster_id is not null;

grant select on public.perspective_feed to anon, authenticated;
