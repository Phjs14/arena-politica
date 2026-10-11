import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getClientIp, hit } from '@/lib/antispam'
import { UUID_RE } from '@/lib/constants'

export const runtime = 'nodejs'

/** POST /api/quiz/answer { sessionId, questionId, chosenIndex }
 *  A resposta correta só existe no servidor: o cliente não consegue "colar" no DevTools. */
export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }) }
  const { sessionId, questionId, chosenIndex } = body ?? {}
  if (
    typeof sessionId !== 'string' || !UUID_RE.test(sessionId) ||
    typeof questionId !== 'string' || !UUID_RE.test(questionId) ||
    !Number.isInteger(chosenIndex) || chosenIndex < 0 || chosenIndex > 10
  ) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })

  if (!(await hit(`rl:quiz:${getClientIp(req)}`, 60, 60))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const db = supabaseAdmin()
  const { data: q, error } = await db
    .from('quiz_questions')
    .select('correct_index, explanation, source_label, source_url')
    .eq('id', questionId)
    .eq('is_active', true)
    .single()
  if (error || !q) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const correct = q.correct_index === chosenIndex

  // Registra a resposta (ignora duplicata da mesma sessão/pergunta)
  await db.from('quiz_responses').upsert(
    { session_id: sessionId, question_id: questionId, chosen_index: chosenIndex, is_correct: correct },
    { onConflict: 'session_id,question_id', ignoreDuplicates: true },
  )

  return NextResponse.json({
    correct,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    sourceLabel: q.source_label,
    sourceUrl: q.source_url,
  })
}
