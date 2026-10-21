-- Remove as quatro coberturas fictícias usadas na comparação de demonstração.
-- A análise de referência (news.url = .../politica/reforma-tributaria-relatorio)
-- permanece para o exemplo da tela de análise.
delete from public.news
where url in (
  'https://exemplo.com.br/folha/reforma-tributaria-arrecadacao',
  'https://exemplo.com.br/estadao/reforma-tributaria-mercado',
  'https://exemplo.com.br/carta-capital/reforma-tributaria-social',
  'https://exemplo.com.br/gazeta/reforma-tributaria-fiscalizacao'
);
