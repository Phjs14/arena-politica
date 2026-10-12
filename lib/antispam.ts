import 'server-only'
import { createHash } from 'crypto'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

/**
 * CAMADAS ANTI-SPAM (da mais barata à mais forte):
 *  1. Cliente: localStorage lembra que já votou (UX; fácil de burlar, só evita cliques acidentais).
 *  2. Cookie httpOnly "arena_vid": identidade anônima do votante -> hash -> unique no banco.
 *  3. Rate limit por IP (janela curta): freia scripts/bots disparando em rajada.
 *  4. Teto diário de votos por IP e duelo: freia quem limpa cookie em loop
 *     (valor alto o bastante para não punir Wi-Fi compartilhado/CGNAT).
 *  5. Banco: unique(duel_id, voter_hash) é a garantia final (à prova de race condition).
 * Para endurecer ainda mais: adicione Cloudflare Turnstile no POST /api/vote.
 */

// ---- Rate limit: Upstash se configurado, senão fallback em memória ----
// Remove espaços e aspas que costumam vir junto ao copiar do painel do Upstash.
const clean = (v?: string) => v?.trim().replace(/^["']|["']$/g, '').trim()

function makeRedis(): Redis | null {
  const url = clean(process.env.UPSTASH_REDIS_REST_URL)
  const token = clean(process.env.UPSTASH_REDIS_REST_TOKEN)
  // O cliente REST exige endereço https:// (não o "rediss://" do painel).
  if (!url || !token || !url.startsWith('https://')) return null
  try {
    return new Redis({ url, token })
  } catch (e) {
    console.error('[antispam] Upstash mal configurado; usando memória:', e)
    return null
  }
}
const redis = makeRedis()

// Fallback: Map em memória. NÃO funciona entre instâncias serverless — use Upstash em produção.
const mem = new Map<string, { n: number; exp: number }>()

/** Retorna true se a requisição está DENTRO do limite. */
export async function hit(key: string, limit: number, windowSec: number): Promise<boolean> {
  if (redis) {
    try {
      const n = await redis.incr(key)
      if (n === 1) await redis.expire(key, windowSec) // define a janela no primeiro hit
      return n <= limit
    } catch (e) {
      // Se o Upstash falhar (chave errada, fora do ar), NÃO derrubamos o site:
      // caímos no limitador em memória abaixo.
      console.error('[antispam] Upstash falhou; usando memória:', e)
    }
  }
  const now = Date.now()
  const cur = mem.get(key)
  if (!cur || cur.exp < now) {
    mem.set(key, { n: 1, exp: now + windowSec * 1000 })
    return true
  }
  cur.n += 1
  return cur.n <= limit
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Hash do votante: nunca persistimos cookie/IP em texto puro. */
export function hashVoter(voterId: string): string {
  return createHash('sha256')
    .update((process.env.VOTER_HASH_SALT ?? 'dev-salt') + ':' + voterId)
    .digest('hex')
}
