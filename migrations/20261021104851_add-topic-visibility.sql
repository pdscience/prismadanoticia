alter table public.topics
add column show_in_trends boolean not null default true;

update public.topics
set show_in_trends = false
where slug = 'reforma-tributaria';

create index topics_show_in_trends_idx
on public.topics (show_in_trends, trend_score desc);
