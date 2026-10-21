-- Schema de leitura pública para o Prisma da Notícia.
-- Escrita fica restrita ao service role / Edge Functions; o front usa a anon key.

create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  scope text not null default 'nacional'
    check (scope in ('nacional', 'regional', 'local', 'segmentado', 'nicho')),
  region text,
  created_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text not null unique,
  trend_score numeric(6, 2) not null default 0,
  outlets_count integer not null default 0 check (outlets_count >= 0),
  articles_count integer not null default 0 check (articles_count >= 0),
  delta numeric(6, 2) not null default 0,
  accent text not null default '#2D6BFF',
  headline text,
  frame_keys text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_frame_keys_valid check (
    frame_keys <@ array[
      'politica', 'economia', 'seguranca', 'ambiente', 'saude', 'social', 'juridico'
    ]::text[]
  )
);

create table public.clusters (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  label text not null,
  size integer not null default 0 check (size >= 0),
  window_start timestamptz,
  window_end timestamptz,
  created_at timestamptz not null default now(),
  unique (topic_id, label)
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  cluster_id uuid references public.clusters(id) on delete set null,
  url text not null unique,
  title text not null,
  author text,
  published_at timestamptz,
  reading_time integer check (reading_time > 0),
  content text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null unique references public.news(id) on delete cascade,
  dna jsonb not null default '{}'::jsonb,
  confidence integer not null check (confidence between 0 and 100),
  source_diversity integer not null check (source_diversity between 0 and 100),
  dominant_frame text not null check (
    dominant_frame in ('politica', 'economia', 'seguranca', 'ambiente', 'saude', 'social', 'juridico')
  ),
  summary jsonb not null default '[]'::jsonb,
  evidences jsonb not null default '[]'::jsonb,
  signals jsonb not null default '[]'::jsonb,
  highlight text,
  angle text,
  tone text,
  accent text,
  created_at timestamptz not null default now()
);

create table public.state_metrics (
  uf char(2) primary key,
  name text not null,
  grid_col smallint not null check (grid_col >= 0),
  grid_row smallint not null check (grid_row >= 0),
  outlets integer not null default 0 check (outlets >= 0),
  polarization integer not null check (polarization between 0 and 100),
  themes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.replay_events (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  sort_order smallint not null,
  time_label text not null,
  label text not null,
  outlets integer not null default 0 check (outlets >= 0),
  dominant_frame text not null,
  sentiment text not null,
  description text not null,
  mix jsonb not null default '{}'::jsonb,
  unique (topic_id, sort_order)
);

create table public.blindspot_reports (
  topic_id uuid primary key references public.topics(id) on delete cascade,
  window_label text not null,
  note text not null,
  updated_at timestamptz not null default now()
);

create table public.blindspot_coverage (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  outlet text not null,
  articles integer not null default 0 check (articles >= 0),
  sort_order smallint not null default 0,
  unique (topic_id, outlet)
);

create table public.blindspot_gaps (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  outlet text not null,
  reach text not null,
  last_mention text not null,
  severity text not null check (severity in ('alta', 'média', 'baixa')),
  sort_order smallint not null default 0,
  unique (topic_id, outlet)
);

create table public.blindspot_subthemes (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  label text not null,
  coverage integer not null check (coverage between 0 and 100),
  sort_order smallint not null default 0,
  unique (topic_id, label)
);

create index news_source_id_idx on public.news (source_id);
create index news_topic_id_idx on public.news (topic_id);
create index news_cluster_id_idx on public.news (cluster_id);
create index news_published_at_idx on public.news (published_at desc);
create index analyses_dominant_frame_idx on public.analyses (dominant_frame);
create index clusters_topic_id_idx on public.clusters (topic_id);
create index replay_events_topic_id_idx on public.replay_events (topic_id, sort_order);
create index blindspot_coverage_topic_id_idx on public.blindspot_coverage (topic_id);
create index blindspot_gaps_topic_id_idx on public.blindspot_gaps (topic_id);
create index blindspot_subthemes_topic_id_idx on public.blindspot_subthemes (topic_id);
create index news_embedding_hnsw_idx on public.news using hnsw (embedding vector_cosine_ops);

create trigger topics_set_updated_at
before update on public.topics
for each row execute function public.set_updated_at();

create trigger state_metrics_set_updated_at
before update on public.state_metrics
for each row execute function public.set_updated_at();

create trigger blindspot_reports_set_updated_at
before update on public.blindspot_reports
for each row execute function public.set_updated_at();

create view public.analysis_feed
with (security_invoker = true)
as
select
  a.id,
  a.news_id,
  n.url,
  n.title,
  n.author,
  n.published_at,
  n.reading_time,
  s.name as outlet,
  s.slug as source_slug,
  t.label as topic,
  t.slug as topic_slug,
  c.id as cluster_id,
  c.size as cluster_size,
  a.confidence,
  a.source_diversity,
  a.dominant_frame,
  a.dna,
  a.summary,
  a.evidences,
  a.signals,
  a.highlight,
  a.angle,
  a.tone,
  a.accent
from public.analyses a
join public.news n on n.id = a.news_id
join public.sources s on s.id = n.source_id
left join public.topics t on t.id = n.topic_id
left join public.clusters c on c.id = n.cluster_id;

create or replace function public.match_news(
  query_embedding vector(1536),
  match_count integer default 10,
  match_threshold double precision default 0.75
)
returns table (
  id uuid,
  title text,
  url text,
  source_name text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = pg_catalog, public, pg_temp
as $$
  select
    n.id,
    n.title,
    n.url,
    s.name as source_name,
    1 - (n.embedding <=> query_embedding) as similarity
  from public.news n
  join public.sources s on s.id = n.source_id
  where n.embedding is not null
    and 1 - (n.embedding <=> query_embedding) >= match_threshold
  order by n.embedding <=> query_embedding
  limit match_count;
$$;

-- Leitura pública, escrita apenas via service role (sem policies de DML).
do $$
declare
  table_name text;
begin
  for table_name in
    select unnest(array[
      'sources',
      'topics',
      'clusters',
      'news',
      'analyses',
      'state_metrics',
      'replay_events',
      'blindspot_reports',
      'blindspot_coverage',
      'blindspot_gaps',
      'blindspot_subthemes'
    ])
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "public read" on public.%I', table_name);
    execute format(
      'create policy "public read" on public.%I for select to anon, authenticated using (true)',
      table_name
    );
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
  end loop;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.analysis_feed to anon, authenticated;
grant execute on function public.match_news(vector, integer, double precision) to anon, authenticated;

-- ── Seed de demonstração ───────────────────────────────────────────────────

insert into public.topics (
  label, slug, trend_score, outlets_count, articles_count, delta, accent, headline, frame_keys
)
values
  ('Reforma Tributária', 'reforma-tributaria', 91.50, 34, 168, 18.20, '#FFC24B',
   'Relator apresenta novo texto da reforma tributária', '{economia,politica}'::text[]),
  ('STF', 'stf', 72.40, 128, 412, 12.40, '#8B5CF6',
   'Julgamento sobre marco temporal entra na pauta da semana', '{juridico,politica}'::text[]),
  ('Congresso', 'congresso', 68.10, 143, 507, 8.10, '#2D6BFF',
   'Congresso retoma agenda de votações prioritárias', '{politica,economia}'::text[]),
  ('Economia', 'economia', 84.70, 167, 638, 21.70, '#FFC24B',
   'Copom sinaliza manutenção da taxa básica de juros', '{economia}'::text[]),
  ('Segurança', 'seguranca', 55.20, 119, 356, -4.30, '#FF3B5C',
   'Operação integrada muda dinâmica de facções no Sudeste', '{seguranca,social}'::text[]),
  ('Meio Ambiente', 'meio-ambiente', 49.80, 94, 231, 15.90, '#2EE6A8',
   'Desmatamento na Amazônia recua pelo terceiro mês', '{ambiente}'::text[])
on conflict (slug) do update set
  label = excluded.label,
  trend_score = excluded.trend_score,
  outlets_count = excluded.outlets_count,
  articles_count = excluded.articles_count,
  delta = excluded.delta,
  accent = excluded.accent,
  headline = excluded.headline,
  frame_keys = excluded.frame_keys;

insert into public.sources (name, slug, scope, region)
values
  ('Veículo de Exemplo', 'veiculo-de-exemplo', 'nacional', 'Brasil'),
  ('Folha', 'folha', 'nacional', 'Brasil'),
  ('Estadão', 'estadao', 'nacional', 'Brasil'),
  ('CartaCapital', 'carta-capital', 'nacional', 'Brasil'),
  ('Gazeta', 'gazeta', 'nacional', 'Brasil'),
  ('G1', 'g1', 'nacional', 'Brasil'),
  ('Valor', 'valor', 'nacional', 'Brasil'),
  ('Veículo Regional Norte', 'veiculo-regional-norte', 'regional', 'Norte'),
  ('Portal Setorial Agro', 'portal-setorial-agro', 'segmentado', 'Agro'),
  ('Rádio Metropolitana', 'radio-metropolitana', 'local', 'Nordeste'),
  ('Revista Cultura Viva', 'revista-cultura-viva', 'nicho', 'Cultura')
on conflict (slug) do update set
  name = excluded.name,
  scope = excluded.scope,
  region = excluded.region;

insert into public.clusters (topic_id, label, size, window_start, window_end)
select
  id,
  'Reforma Tributária',
  34,
  '2026-08-30T00:00:00-03:00'::timestamptz,
  '2026-09-01T23:59:59-03:00'::timestamptz
from public.topics
where slug = 'reforma-tributaria'
on conflict (topic_id, label) do update set
  size = excluded.size,
  window_start = excluded.window_start,
  window_end = excluded.window_end;

insert into public.news (
  source_id, topic_id, cluster_id, url, title, author, published_at, reading_time
)
select
  s.id,
  t.id,
  c.id,
  v.url,
  v.title,
  v.author,
  v.published_at,
  v.reading_time
from public.topics t
join public.clusters c on c.topic_id = t.id and c.label = 'Reforma Tributária'
cross join (
  values
    (
      'veiculo-de-exemplo',
      'https://exemplo.com.br/politica/reforma-tributaria-relatorio',
      'Relator entrega texto da reforma tributária com mudanças no imposto sobre consumo',
      'Redação',
      '2026-08-30T11:20:00-03:00'::timestamptz,
      6
    ),
    (
      'folha',
      'https://exemplo.com.br/folha/reforma-tributaria-arrecadacao',
      'Reforma tributária: impacto na arrecadação e nas contas públicas',
      'Redação',
      '2026-08-30T14:00:00-03:00'::timestamptz,
      5
    ),
    (
      'estadao',
      'https://exemplo.com.br/estadao/reforma-tributaria-mercado',
      'Mercado reage ao novo texto da reforma tributária',
      'Redação',
      '2026-08-30T15:30:00-03:00'::timestamptz,
      4
    ),
    (
      'carta-capital',
      'https://exemplo.com.br/carta-capital/reforma-tributaria-social',
      'Reforma tributária: efeitos sobre desigualdade e consumo popular',
      'Redação',
      '2026-08-31T09:00:00-03:00'::timestamptz,
      7
    ),
    (
      'gazeta',
      'https://exemplo.com.br/gazeta/reforma-tributaria-fiscalizacao',
      'Fiscalização e combate a fraudes na reforma tributária',
      'Redação',
      '2026-08-31T11:00:00-03:00'::timestamptz,
      5
    )
) as v(source_slug, url, title, author, published_at, reading_time)
join public.sources s on s.slug = v.source_slug
where t.slug = 'reforma-tributaria'
on conflict (url) do update set
  source_id = excluded.source_id,
  topic_id = excluded.topic_id,
  cluster_id = excluded.cluster_id,
  title = excluded.title,
  author = excluded.author,
  published_at = excluded.published_at,
  reading_time = excluded.reading_time;

insert into public.analyses (
  news_id, dna, confidence, source_diversity, dominant_frame, summary, evidences, signals
)
select
  n.id,
  '{"emocao":41,"fontes":68,"evidencias":91,"persuasao":37,"equilibrio":74,"narrativa":63}'::jsonb,
  82,
  68,
  'economia',
  '["O relatório apresentado nesta semana altera as regras de transição do imposto sobre consumo e cria uma trava de arrecadação para estados.","Setores de serviços afirmam que a alíquota efetiva sobe, enquanto a indústria comemora a simplificação de tributos em cascata.","O texto ainda depende de votação nas comissões e pode sofrer alterações antes de ir ao plenário."]'::jsonb,
  '[{"kind":"Documento","strength":"forte","label":"Texto do relatório (PDF oficial)","note":"Citado com número de páginas e trechos reproduzidos."},{"kind":"Dado","strength":"forte","label":"Projeção de arrecadação — 2027 a 2033","note":"Fonte primária identificada, com metodologia informada."},{"kind":"Declaração","strength":"média","label":"Entrevista com relator","note":"Fala reproduzida sem contraponto direto no mesmo trecho."},{"kind":"Declaração","strength":"fraca","label":"\"Fontes do governo\" sem identificação","note":"Atribuição genérica reduz a verificabilidade."}]'::jsonb,
  '[{"label":"Contraditório presente","ok":true},{"label":"Dados com fonte primária","ok":true},{"label":"Título compatível com o texto","ok":true},{"label":"Uso de fonte anônima","ok":false},{"label":"Trecho com adjetivação avaliativa","ok":false}]'::jsonb
from public.news n
where n.url = 'https://exemplo.com.br/politica/reforma-tributaria-relatorio'
on conflict (news_id) do update set
  dna = excluded.dna,
  confidence = excluded.confidence,
  source_diversity = excluded.source_diversity,
  dominant_frame = excluded.dominant_frame,
  summary = excluded.summary,
  evidences = excluded.evidences,
  signals = excluded.signals;

insert into public.analyses (
  news_id, dna, confidence, source_diversity, dominant_frame, summary,
  highlight, angle, tone, accent
)
select
  n.id,
  v.dna,
  v.confidence,
  v.source_diversity,
  v.dominant_frame,
  v.summary,
  v.highlight,
  v.angle,
  v.tone,
  v.accent
from public.news n
join (
  values
    (
      'https://exemplo.com.br/folha/reforma-tributaria-arrecadacao',
      '{"emocao":38,"fontes":74,"evidencias":88,"persuasao":33,"equilibrio":76,"narrativa":61}'::jsonb,
      84,
      74,
      'economia',
      '["Impacto na arrecadação e nas contas públicas."]'::jsonb,
      'Economia',
      'Impacto na arrecadação e nas contas públicas',
      'Analítico',
      '#2D6BFF'
    ),
    (
      'https://exemplo.com.br/estadao/reforma-tributaria-mercado',
      '{"emocao":34,"fontes":69,"evidencias":84,"persuasao":41,"equilibrio":66,"narrativa":71}'::jsonb,
      81,
      69,
      'economia',
      '["Reação de investidores e do setor produtivo."]'::jsonb,
      'Mercado',
      'Reação de investidores e do setor produtivo',
      'Técnico',
      '#FFC24B'
    ),
    (
      'https://exemplo.com.br/carta-capital/reforma-tributaria-social',
      '{"emocao":66,"fontes":58,"evidencias":72,"persuasao":63,"equilibrio":49,"narrativa":82}'::jsonb,
      76,
      58,
      'social',
      '["Efeitos sobre desigualdade e consumo popular."]'::jsonb,
      'Social',
      'Efeitos sobre desigualdade e consumo popular',
      'Crítico',
      '#8B5CF6'
    ),
    (
      'https://exemplo.com.br/gazeta/reforma-tributaria-fiscalizacao',
      '{"emocao":47,"fontes":52,"evidencias":69,"persuasao":44,"equilibrio":58,"narrativa":55}'::jsonb,
      73,
      52,
      'seguranca',
      '["Fiscalização, sonegação e combate a fraudes."]'::jsonb,
      'Segurança',
      'Fiscalização, sonegação e combate a fraudes',
      'Factual',
      '#FF3B5C'
    )
) as v(
  url, dna, confidence, source_diversity, dominant_frame, summary,
  highlight, angle, tone, accent
) on v.url = n.url
on conflict (news_id) do update set
  dna = excluded.dna,
  confidence = excluded.confidence,
  source_diversity = excluded.source_diversity,
  dominant_frame = excluded.dominant_frame,
  summary = excluded.summary,
  highlight = excluded.highlight,
  angle = excluded.angle,
  tone = excluded.tone,
  accent = excluded.accent;

insert into public.state_metrics (uf, name, grid_col, grid_row, outlets, polarization, themes)
values
  ('RR','Roraima',3,0,14,61,'{"economia":18,"seguranca":34,"ambiente":26,"saude":12,"politica":10}'::jsonb),
  ('AP','Amapá',4,0,11,44,'{"economia":20,"seguranca":22,"ambiente":34,"saude":14,"politica":10}'::jsonb),
  ('AM','Amazonas',2,1,38,57,'{"economia":21,"seguranca":24,"ambiente":33,"saude":12,"politica":10}'::jsonb),
  ('PA','Pará',3,1,46,66,'{"economia":24,"seguranca":22,"ambiente":32,"saude":11,"politica":11}'::jsonb),
  ('MA','Maranhão',5,1,29,52,'{"economia":26,"seguranca":28,"ambiente":16,"saude":18,"politica":12}'::jsonb),
  ('CE','Ceará',6,1,52,58,'{"economia":29,"seguranca":30,"ambiente":11,"saude":16,"politica":14}'::jsonb),
  ('RN','Rio Grande do Norte',7,1,26,49,'{"economia":27,"seguranca":31,"ambiente":12,"saude":17,"politica":13}'::jsonb),
  ('AC','Acre',1,2,12,47,'{"economia":19,"seguranca":27,"ambiente":31,"saude":13,"politica":10}'::jsonb),
  ('RO','Rondônia',2,2,17,54,'{"economia":25,"seguranca":26,"ambiente":28,"saude":11,"politica":10}'::jsonb),
  ('TO','Tocantins',4,2,15,41,'{"economia":30,"seguranca":22,"ambiente":24,"saude":13,"politica":11}'::jsonb),
  ('PI','Piauí',5,2,19,45,'{"economia":28,"seguranca":25,"ambiente":15,"saude":20,"politica":12}'::jsonb),
  ('PE','Pernambuco',6,2,48,63,'{"economia":28,"seguranca":32,"ambiente":10,"saude":16,"politica":14}'::jsonb),
  ('PB','Paraíba',7,2,24,50,'{"economia":27,"seguranca":29,"ambiente":12,"saude":18,"politica":14}'::jsonb),
  ('MT','Mato Grosso',3,3,22,59,'{"economia":38,"seguranca":18,"ambiente":27,"saude":9,"politica":8}'::jsonb),
  ('GO','Goiás',4,3,34,55,'{"economia":35,"seguranca":24,"ambiente":14,"saude":15,"politica":12}'::jsonb),
  ('BA','Bahia',5,3,61,64,'{"economia":27,"seguranca":30,"ambiente":14,"saude":15,"politica":14}'::jsonb),
  ('AL','Alagoas',6,3,18,51,'{"economia":26,"seguranca":33,"ambiente":11,"saude":17,"politica":13}'::jsonb),
  ('SE','Sergipe',7,3,15,46,'{"economia":27,"seguranca":30,"ambiente":12,"saude":18,"politica":13}'::jsonb),
  ('MS','Mato Grosso do Sul',3,4,21,48,'{"economia":36,"seguranca":21,"ambiente":24,"saude":10,"politica":9}'::jsonb),
  ('DF','Distrito Federal',4,4,57,78,'{"economia":26,"seguranca":14,"ambiente":8,"saude":10,"politica":42}'::jsonb),
  ('MG','Minas Gerais',5,4,72,60,'{"economia":33,"seguranca":23,"ambiente":17,"saude":14,"politica":13}'::jsonb),
  ('ES','Espírito Santo',6,4,23,47,'{"economia":32,"seguranca":26,"ambiente":18,"saude":13,"politica":11}'::jsonb),
  ('PR','Paraná',4,5,55,62,'{"economia":37,"seguranca":22,"ambiente":15,"saude":14,"politica":12}'::jsonb),
  ('SP','São Paulo',5,5,143,74,'{"economia":41,"seguranca":22,"ambiente":10,"saude":13,"politica":14}'::jsonb),
  ('RJ','Rio de Janeiro',6,5,98,81,'{"economia":27,"seguranca":38,"ambiente":9,"saude":12,"politica":14}'::jsonb),
  ('SC','Santa Catarina',4,6,41,53,'{"economia":39,"seguranca":21,"ambiente":17,"saude":12,"politica":11}'::jsonb),
  ('RS','Rio Grande do Sul',4,7,58,69,'{"economia":34,"seguranca":23,"ambiente":20,"saude":12,"politica":11}'::jsonb)
on conflict (uf) do update set
  name = excluded.name,
  grid_col = excluded.grid_col,
  grid_row = excluded.grid_row,
  outlets = excluded.outlets,
  polarization = excluded.polarization,
  themes = excluded.themes;

insert into public.replay_events (
  topic_id, sort_order, time_label, label, outlets, dominant_frame, sentiment, description, mix
)
select
  t.id,
  v.sort_order,
  v.time_label,
  v.label,
  v.outlets,
  v.dominant_frame,
  v.sentiment,
  v.description,
  v.mix
from public.topics t
cross join (
  values
    (
      1,
      'Dia 1 — 08h',
      'Vazamento do relatório',
      9,
      'Político',
      'Neutro',
      'As primeiras publicações tratam o fato como articulação política, sem números detalhados.',
      '{"politica":62,"economia":20,"social":10,"seguranca":8}'::jsonb
    ),
    (
      2,
      'Dia 1 — 15h',
      'Números começam a circular',
      27,
      'Econômico',
      'Cauteloso',
      'Veículos econômicos assumem a dianteira e o enquadramento migra para arrecadação e alíquotas.',
      '{"politica":34,"economia":48,"social":12,"seguranca":6}'::jsonb
    ),
    (
      3,
      'Dia 2 — 09h',
      'Reação dos setores',
      58,
      'Mercado',
      'Polarizado',
      'Indústria e serviços divergem publicamente. A emoção média das matérias sobe 19 pontos.',
      '{"politica":26,"economia":44,"social":22,"seguranca":8}'::jsonb
    ),
    (
      4,
      'Dia 3 — 12h',
      'Entra o ângulo social',
      74,
      'Social',
      'Crítico',
      'Cobertura passa a discutir desigualdade e consumo popular. Novas fontes acadêmicas aparecem.',
      '{"politica":21,"economia":33,"social":38,"seguranca":8}'::jsonb
    ),
    (
      5,
      'Dia 5 — 18h',
      'Consolidação da narrativa',
      96,
      'Econômico',
      'Estabilizado',
      'O enquadramento econômico se firma como dominante e a diversidade de fontes atinge o pico.',
      '{"politica":24,"economia":46,"social":24,"seguranca":6}'::jsonb
    )
) as v(
  sort_order, time_label, label, outlets, dominant_frame, sentiment, description, mix
)
where t.slug = 'reforma-tributaria'
on conflict (topic_id, sort_order) do update set
  time_label = excluded.time_label,
  label = excluded.label,
  outlets = excluded.outlets,
  dominant_frame = excluded.dominant_frame,
  sentiment = excluded.sentiment,
  description = excluded.description,
  mix = excluded.mix;

insert into public.blindspot_reports (topic_id, window_label, note)
select
  id,
  'Período analisado: 30 dias (01/08 a 30/08)',
  'A comparação sempre considera um período específico antes de indicar ausência de cobertura.'
from public.topics
where slug = 'reforma-tributaria'
on conflict (topic_id) do update set
  window_label = excluded.window_label,
  note = excluded.note;

insert into public.blindspot_coverage (topic_id, outlet, articles, sort_order)
select t.id, v.outlet, v.articles, v.sort_order
from public.topics t
cross join (
  values
    ('Folha', 41, 1),
    ('Estadão', 37, 2),
    ('G1', 52, 3),
    ('CartaCapital', 18, 4),
    ('Valor', 44, 5),
    ('Gazeta', 12, 6)
) as v(outlet, articles, sort_order)
where t.slug = 'reforma-tributaria'
on conflict (topic_id, outlet) do update set
  articles = excluded.articles,
  sort_order = excluded.sort_order;

insert into public.blindspot_gaps (
  topic_id, outlet, reach, last_mention, severity, sort_order
)
select
  t.id,
  v.outlet,
  v.reach,
  v.last_mention,
  v.severity,
  v.sort_order
from public.topics t
cross join (
  values
    ('Veículo Regional Norte', 'Regional • Norte', '19 dias sem publicar sobre o tema', 'alta', 1),
    ('Portal Setorial Agro', 'Segmentado • Agro', '12 dias sem publicar sobre o tema', 'média', 2),
    ('Rádio Metropolitana', 'Local • Nordeste', '26 dias sem publicar sobre o tema', 'alta', 3),
    ('Revista Cultura Viva', 'Nicho • Cultura', 'Sem registro no período', 'baixa', 4)
) as v(outlet, reach, last_mention, severity, sort_order)
where t.slug = 'reforma-tributaria'
on conflict (topic_id, outlet) do update set
  reach = excluded.reach,
  last_mention = excluded.last_mention,
  severity = excluded.severity,
  sort_order = excluded.sort_order;

insert into public.blindspot_subthemes (topic_id, label, coverage, sort_order)
select t.id, v.label, v.coverage, v.sort_order
from public.topics t
cross join (
  values
    ('Transição de alíquotas', 86, 1),
    ('Impacto em pequenos negócios', 41, 2),
    ('Efeito regional na arrecadação', 23, 3),
    ('Custo de conformidade', 18, 4)
) as v(label, coverage, sort_order)
where t.slug = 'reforma-tributaria'
on conflict (topic_id, label) do update set
  coverage = excluded.coverage,
  sort_order = excluded.sort_order;
