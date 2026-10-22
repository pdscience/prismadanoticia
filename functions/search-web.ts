import { createAdminClient } from 'npm:@insforge/sdk'

/**
 * BUSCA WEB DE COBERTURA — encontra matérias reais sobre um tema.
 *
 * Usa o plugin de busca web do OpenRouter (mesma chave já configurada para as
 * análises) e devolve candidatos crus. O filtro de domínios, o dedup por veículo
 * e o limite de matérias ficam no front (`src/lib/websearch.js`).
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_PER_IP = 10
const RATE_LIMIT_GLOBAL = 50
const CACHE_WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_RESULTS = 12
const MIN_TOPIC_LENGTH = 3
const MAX_TOPIC_LENGTH = 120

const SYSTEM_PROMPT = `Você é um buscador de imprensa brasileira.
Responda SOMENTE com um JSON válido, sem markdown, no formato:
{"results":[{"url":"https://...","title":"...","outlet":"..."}]}

Regras:
- Liste de 6 a 10 MATÉRIAS DE IMPRENSA sobre o tema informado, cada uma de um veículo diferente.
- Priorize materias publicadas nos ultimos 30 dias; evite textos antigos e apenas arquivos historicos.
- Use portais de noticias brasileiros (g1.globo.com, folha.uol.com.br, oglobo.globo.com, estadao.com.br, cnnbrasil.com.br, poder360.com.br, metropoles.com, uol.com.br, valor.globo.com, exame.com, nexo Jornal, agenciabrasil.ebc.com.br, gazetadopovo.com.br, terra.com.br e afins).
- NAO inclua portais do governo (gov.br), enciclopedias, blogs, redes sociais, foruns ou paginas de indice/assinate.
- So inclua URLs de materias reais ja publicadas; nunca invente URLs.
- "outlet" e o nome do veiculo; "title" e o titulo da materia.`

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanTopic(value) {
  if (typeof value !== 'string') return null
  const topic = value.replace(/\s+/g, ' ').trim().slice(0, MAX_TOPIC_LENGTH)
  if (topic.length < MIN_TOPIC_LENGTH) return null
  return topic
}

function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`
  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null
  parsed.hash = ''
  return parsed.href
}

function outletFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function parseJsonContent(content) {
  const text = String(content ?? '').trim()
  const withoutFence = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(withoutFence)
}

/** Candidatos citados pelo modelo, normalizados e sem repetição de URL. */
function collectResults(message) {
  const seen = new Set()
  const results = []

  const push = (rawUrl, rawTitle, rawOutlet) => {
    const url = normalizeUrl(rawUrl)
    if (!url) return
    if (seen.has(url)) return
    seen.add(url)
    results.push({
      url,
      title:
        String(rawTitle ?? '')
          .trim()
          .slice(0, 300) || outletFromUrl(url),
      outlet:
        String(rawOutlet ?? '')
          .trim()
          .slice(0, 80) || outletFromUrl(url),
    })
  }

  let parsed = null
  try {
    parsed = parseJsonContent(message?.content)
  } catch {
    parsed = null
  }

  const list = Array.isArray(parsed?.results) ? parsed.results : []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    push(item.url, item.title, item.outlet)
  }

  // As citações do plugin cobrem o que o modelo deixou de fora do JSON.
  for (const annotation of message?.annotations ?? []) {
    const citation = annotation?.url_citation
    if (!citation?.url) continue
    push(citation.url, citation.title, '')
  }

  return results.slice(0, MAX_RESULTS)
}

function getAdmin() {
  const baseUrl = Deno.env.get('INSFORGE_BASE_URL')
  const apiKey = Deno.env.get('API_KEY')
  if (!baseUrl || !apiKey) throw new Error('Credenciais administrativas do InsForge ausentes.')
  return createAdminClient({ baseUrl, apiKey })
}

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 200)
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('true-client-ip') ||
    ''
  )
}

async function hashIp(ip) {
  const salt = Deno.env.get('RATE_LIMIT_SALT') ?? 'prisma-rate-limit'
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function findCached(slug) {
  const since = new Date(Date.now() - CACHE_WINDOW_MS).toISOString()
  const row = await getAdmin()
    .database.from('web_searches')
    .select('results,created_at')
    .eq('query_slug', slug)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (row?.error) throw new Error(`Ler cache: ${row.error.message}`)
  const results = Array.isArray(row?.data?.results) ? row.data.results : []
  return results.length ? { results, searchedAt: row.data.created_at } : null
}

async function enforceRateLimit(ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const admin = getAdmin()

  if (ipHash) {
    const { data, error } = await admin.database
      .from('web_searches')
      .select('id')
      .eq('ip_hash', ipHash)
      .gte('created_at', since)
      .limit(RATE_LIMIT_PER_IP + 1)
    if (error) throw new Error(`Limite por IP: ${error.message}`)
    if ((data?.length ?? 0) >= RATE_LIMIT_PER_IP) return false
  }

  const { data: globalRows, error: globalError } = await admin.database
    .from('web_searches')
    .select('id')
    .gte('created_at', since)
    .limit(RATE_LIMIT_GLOBAL + 1)
  if (globalError) throw new Error(`Limite global: ${globalError.message}`)
  if ((globalRows?.length ?? 0) >= RATE_LIMIT_GLOBAL) return false

  return true
}

async function saveSearch({ topic, slug, results, ipHash }) {
  const { error } = await getAdmin()
    .database.from('web_searches')
    .insert([{ query: topic, query_slug: slug, results, ip_hash: ipHash }])
  if (error) console.error('[search-web] cache', error)
}

async function searchWeb(topic) {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) throw new Error('OPENROUTER_API_KEY não configurada no projeto.')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'http-referer': 'https://github.com/pdscience/prismadanoticia',
      'x-title': 'Prisma da Notícia',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENROUTER_SEARCH_MODEL') ?? 'openai/gpt-4o-mini',
      temperature: 0,
      max_tokens: 1600,
      response_format: { type: 'json_object' },
      plugins: [{ id: 'web', max_results: 10 }],
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Tema: ${topic}\nData de hoje: ${new Date().toISOString().slice(0, 10)}.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenRouter respondeu ${response.status}: ${detail.slice(0, 200)}`)
  }

  const payload = await response.json()
  return collectResults(payload?.choices?.[0]?.message)
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405)

  try {
    const body = await req.json().catch(() => null)
    const topic = cleanTopic(body?.topic)
    if (!topic) return json({ error: 'Informe um tema com pelo menos 3 caracteres.' }, 400)

    const slug = slugify(topic) || 'tema'
    const cached = await findCached(slug)
    if (cached) {
      return json({ topic, results: cached.results, cached: true, searchedAt: cached.searchedAt })
    }

    const ip = getClientIp(req)
    const ipHash = ip ? await hashIp(ip) : null
    const allowed = await enforceRateLimit(ipHash)
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Limite de buscas por hora atingido. Tente novamente mais tarde.',
        }),
        {
          status: 429,
          headers: { ...CORS, 'Content-Type': 'application/json', 'Retry-After': '3600' },
        },
      )
    }

    const results = await searchWeb(topic)
    if (!results.length) {
      return json({ error: 'A busca não encontrou matérias sobre este tema.' }, 404)
    }

    await saveSearch({ topic, slug, results, ipHash })
    return json({ topic, results, cached: false, searchedAt: new Date().toISOString() })
  } catch (error) {
    console.error('[search-web]', error)
    const message = error instanceof Error ? error.message : 'Falha ao buscar na internet.'
    return json({ error: message }, 502)
  }
}
