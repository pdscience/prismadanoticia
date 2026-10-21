import { describe, expect, it } from 'vitest'

import { extractArticle } from '../../functions/analyze-url.ts'

describe('extractArticle', () => {
  it('extrai o texto de uma página que só expõe a matéria em JSON-LD', () => {
    const articleBody =
      'Flávio Bolsonaro (PL) aparece com 45% das intenções de voto contra 44% de Lula (PT) num cenário de 2º turno, segundo pesquisa Quaest divulgada em 21/10. No levantamento, branco, nulo e não vai votar somam 9%, e os indecisos ficam em 2%. Na comparação entre 14/out e 21/out, os percentuais dos dois candidatos oscilam. Na pesquisa espontânea, Flávio e Lula marcam 40% cada, e os indecisos chegam a 14%. A rejeição no 2º turno é de 52% para Flávio e 47% para Lula.'
    const html = `<html><head>
      <meta property="og:title" content="Flávio Bolsonaro tem 45% e Lula, 44%, diz Quaest">
      <meta property="og:site_name" content="UOL">
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: 'Flávio Bolsonaro tem 45% e Lula, 44%, diz Quaest',
        articleBody,
        datePublished: '2026-10-21T10:34:09-03:00',
      })}</script>
    </head><body></body></html>`

    const article = extractArticle(html, 'https://www.uol.com.br/flash/?c=abc')

    expect(article.text).toContain('pesquisa Quaest')
    expect(article.text.length).toBeGreaterThan(300)
    expect(article.publishedAt).toBe('2026-10-21T13:34:09.000Z')
  })

  it('preserva apóstrofo no título e lê a data publicada via itemprop', () => {
    const paragraph =
      'A defesa do candidato apresentou uma petição ao TSE com condições para abrir os sigilos. '.repeat(
        5,
      )
    const html = `<html><head>
      <meta property="og:title" content="Em resposta a 'desafio' de Lula, Flávio impõe condições | G1">
      <meta property="og:site_name" content="G1">
      <meta itemprop="datePublished" content="2026-10-21T14:18:27.653-03:00">
    </head><body><h1>Em resposta a 'desafio' de Lula</h1><p>${paragraph}</p></body></html>`

    const article = extractArticle(html, 'https://g1.globo.com/politica/noticia.ghtml')

    expect(article.title).toBe("Em resposta a 'desafio' de Lula, Flávio impõe condições | G1")
    expect(article.publishedAt).toBe('2026-10-21T17:18:27.653Z')
  })
})
