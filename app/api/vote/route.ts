import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getClientIp, hashVoter, hit } from '@/lib/antispam'
import { UF_SET, UUID_RE } from '@/lib/constants'

export const runtime = 'nodejs'

/** POST /api/vote  { duelId, side: 'A'|'B', uf } */
export async function POST(req: NextRequest) {
  // Interruptor de emergência (mesma variável do front): pausa novos votos no servidor.
  if (process.env.NEXT_PUBLIC_VOTING_ENABLED === 'false') {
    return NextResponse.json({ error: 'voting_paused' }, { status: 403 })
  }

  // 1) Validação estrita do payload
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }) }
  const { duelId, side, uf } = body ?? {}
  if (typeof duelId !== 'string' || !UUID_RE.test(duelId) || (side !== 'A' && side !== 'B') || !UF_SET.has(uf)) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  // 2) Rate limit por IP: rajada curta + teto diário por duelo
  const ip = getClientIp(req)
  const okBurst = await hit(`rl:vote:${ip}`, 12, 60)
  const okDaily = await hit(`cap:${duelId}:${ip}`, 30, 60 * 60 * 24)
  if (!okBurst || !okDaily) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  // 3) Identidade anônima via cookie httpOnly (criada no primeiro voto)
  const voterId = req.cookies.get('arena_vid')?.value ?? crypto.randomUUID()
  const voterHash = hashVoter(voterId)

  // 4) Voto atômico no Postgres (dedupe + contador na mesma transação)
  const { data, error } = await supabaseAdmin().rpc('cast_vote', {
    p_duel_id: duelId,
    p_uf: uf,
    p_side: side,
    p_voter_hash: voterHash,
  })
  if (error) {
    console.error('cast_vote error', error.message)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  const accepted = Boolean((data as any)?.accepted)
  const res = NextResponse.json({ accepted }, { status: accepted ? 200 : 409 })
  res.cookies.set('arena_vid', voterId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return res
}
