alter table public.bias_analyses
add column if not exists outlet_estimate_rationale text,
add column if not exists distortion_summary text;

drop view if exists public.bias_feed;

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
  b.outlet_estimate_rationale,
  b.distortion_risk,
  b.distortion_summary,
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

grant select on public.bias_feed to anon, authenticated;
