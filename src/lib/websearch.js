/**
 * Normalização dos candidatos vindos da busca web.
 *
 * A edge function devolve os resultados crus (citações do OpenRouter). Aqui
 * filtramos o que não é matéria de imprensa, mantemos um artigo por veículo e
 * limitamos a quantidade oferecida ao usuário.
 */

/** Domínios que nunca são veículos de imprensa. */
const BLOCKED_SUFFIXES = [
  '.gov.br',
  '.edu.br',
  '.gov',
  '.mil.br',
  'wikipedia.org',
  'fandom.com',
  'blogspot.com',
  'blogspot.com.br',
  'wordpress.com',
  'wixsite.com',
  'medium.com',
  'substack.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'linkedin.com',
  'reddit.com',
  'quora.com',
  'pinterest.com',
  'telegram.org',
  't.me',
  'amazon.com.br',
  'mercadolivre.com.br',
  'olx.com.br',
  'glassdoor.com',
  'wikipedia.br',
  'gutenberg.org',
  'archive.org',
  'issuu.com',
  'slideshare.net',
  'scribd.com',
  'canva.com',
  'docs.google.com',
  'drive.google.com',
  'wikipedia',
]

/** Nomes conhecidos de veículos, para exibir a marca em vez do host. */
const OUTLET_NAMES = {
  'g1.globo.com': 'G1',
  'oglobo.globo.com': 'O Globo',
  'valor.globo.com': 'Valor',
  'valorinveste.globo.com': 'Valor Investe',
  'folha.uol.com.br': 'Folha',
  'uol.com.br': 'UOL',
  'band.uol.com.br': 'Band',
  'estadao.com.br': 'Estadão',
  'cnnbrasil.com.br': 'CNN Brasil',
  'poder360.com.br': 'Poder360',
  'metropoles.com': 'Metrópoles',
  'exame.com': 'Exame',
  'gazetadopovo.com.br': 'Gazeta do Povo',
  'terra.com.br': 'Terra',
  'agenciabrasil.ebc.com.br': 'Agência Brasil',
  'agenciabrasil.ebc.com.br/pt-br': 'Agência Brasil',
  'nexojornal.com.br': 'Nexo Jornal',
  'theintercept.com.br': 'The Intercept',
  'r7.com': 'R7',
  'sbt.com.br': 'SBT',
  'jornalagora.com.br': 'Jornal Agora',
  'diariodoagrado.com.br': 'Diário do Agrado',
  'jc.ne10.uol.com.br': 'JC',
  'folhadepolitica.com.br': 'Folha de Política',
  'migalhas.com.br': 'Migalhas',
  'jota.info': 'JOTA',
  'conjur.com.br': 'Conjur',
  'sindicalista.org.br': 'Sindicalista',
}

/** Quantidade de matérias oferecidas ao usuário. */
export const MAX_CANDIDATES = 6

/** Quantidade máxima de matérias analisadas por rodada. */
export const MAX_SELECTION = 4

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** Verdadeiro quando o host pertence a um domínio bloqueado. */
export function isBlockedHost(host) {
  if (!host) return true
  return BLOCKED_SUFFIXES.some((suffix) => host === suffix || host.endsWith(suffix))
}

/** Nome de exibição do veículo. */
export function outletName(url) {
  const host = hostOf(url)
  if (!host) return ''
  if (OUTLET_NAMES[host]) return OUTLET_NAMES[host]
  const parts = host.split('.')
  const label = parts.length > 2 ? parts[0] : parts[0]
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Rótulo do veículo: prefere a marca conhecida pelo host e usa o nome vindo
 * do modelo apenas como reserva.
 */
export function outletLabel(url, fallback = '') {
  const host = hostOf(url)
  if (host && OUTLET_NAMES[host]) return OUTLET_NAMES[host]
  const clean = String(fallback ?? '').trim()
  if (clean && !clean.includes(' ')) return clean
  return outletName(url) || clean
}

/** A URL parece apontar para uma matéria (e não para a home do site). */
function looksLikeArticle(url) {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '')
    return path.split('/').filter(Boolean).length >= 1
  } catch {
    return false
  }
}

/**
 * Filtra, deduplica e limita os candidatos da busca.
 * Devolve no máximo `MAX_CANDIDATES` matérias, uma por veículo.
 * Veículos conhecidos vêm primeiro; os demais completam a lista.
 */
export function normalizeSearchResults(results, limit = MAX_CANDIDATES) {
  const seenHosts = new Set()
  const known = []
  const others = []

  for (const item of results ?? []) {
    const url = typeof item?.url === 'string' ? item.url.trim() : ''
    if (!url) continue
    const host = hostOf(url)
    if (!host || isBlockedHost(host)) continue
    if (!looksLikeArticle(url)) continue
    if (seenHosts.has(host)) continue

    const title = String(item?.title ?? '')
      .replace(/\s+/g, ' ')
      .trim()
    seenHosts.add(host)
    const candidate = {
      url,
      title: title || outletName(url),
      outlet: outletLabel(url, item?.outlet),
      host,
    }
    if (OUTLET_NAMES[host]) known.push(candidate)
    else others.push(candidate)
  }

  return [...known, ...others].slice(0, limit)
}
