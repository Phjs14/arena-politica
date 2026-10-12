'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ExternalLink, Loader2, RotateCcw, Trophy, X } from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser'
import StoryShareButton from './StoryShare'
import Avatar from './Avatar'
import type { AnswerResult, QuizQuestionPublic } from '@/lib/types'

const QUIZ_SIZE = 5

type Phase = 'loading' | 'playing' | 'finished' | 'error'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Sessão anônima do quiz (uuid guardado no navegador). */
function getSessionId(): string {
  try {
    let id = localStorage.getItem('arena:quiz-session')
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('arena:quiz-session', id) }
    return id
  } catch { return crypto.randomUUID() }
}

function tier(score: number, total: number) {
  const r = total ? score / total : 0
  if (r === 1) return 'Mestre da Arena 🏆'
  if (r >= 0.6) return 'Bem informado 🔥'
  if (r >= 0.4) return 'Em treinamento 📚'
  return 'Calouro da Arena 🌱'
}

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<QuizQuestionPublic[]>([])
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [answerError, setAnswerError] = useState(false)

  const load = useCallback(async () => {
    setPhase('loading')
    setIdx(0); setScore(0); setChosen(null); setResult(null)
    // View pública: traz opções e fotos, mas NUNCA a resposta correta.
    const { data, error } = await getBrowserClient()
      .from('quiz_questions_public')
      .select('id, statement, options, option_images')
      .limit(60)
    if (error || !data?.length) { setPhase('error'); return }
    setQuestions(shuffle(data as QuizQuestionPublic[]).slice(0, QUIZ_SIZE))
    setPhase('playing')
  }, [])

  useEffect(() => { load() }, [load])

  async function answer(optionIndex: number) {
    if (chosen !== null || checking) return
    const q = questions[idx]
    setChosen(optionIndex)
    setAnswerError(false)
    setChecking(true)
    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId(), questionId: q.id, chosenIndex: optionIndex }),
      })
      if (!res.ok) throw new Error('falha')
      const data: AnswerResult = await res.json()
      setResult(data)
      if (data.correct) setScore((s) => s + 1)
    } catch {
      setChosen(null)
      setAnswerError(true)
    } finally {
      setChecking(false)
    }
  }

  function next() {
    if (idx + 1 >= questions.length) { setPhase('finished'); return }
    setIdx((i) => i + 1)
    setChosen(null)
    setResult(null)
  }

  const q = questions[idx]
  // Se ao menos uma opção da pergunta tem foto, TODAS mostram avatar (as sem foto usam iniciais).
  const photos = q?.option_images ?? []
  const hasPhotos = photos.some(Boolean)

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-8">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
        <Trophy className="h-4 w-4" /> Quiz
      </div>
      <h2 className="mb-5 text-2xl font-black sm:text-3xl">Quem Disse Isso?</h2>

      {phase === 'loading' && <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>}

      {phase === 'error' && (
        <div className="py-10 text-center text-zinc-400">
          Não foi possível carregar o quiz.{' '}
          <button onClick={load} className="underline">Tentar de novo</button>
        </div>
      )}

      {phase === 'playing' && q && (
        <>
          <div className="mb-4 flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < idx ? 'bg-cyan-400' : i === idx ? 'bg-white' : 'bg-white/15'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, rotateY: 70, x: 30 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: -70, x: -30 }}
              transition={{ duration: 0.3 }}
              style={{ transformPerspective: 900 }}
            >
              <p className="mb-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 text-lg font-semibold leading-snug sm:text-2xl">
                “{q.statement}”
              </p>

              <div className="grid gap-3">
                {q.options.map((opt, i) => {
                  const isChosen = chosen === i
                  const isCorrect = result?.correctIndex === i
                  const revealed = result !== null
                  const cls = revealed
                    ? isCorrect ? 'border-emerald-400 bg-emerald-500/20'
                      : isChosen ? 'border-rose-400 bg-rose-500/20' : 'border-white/10 opacity-50'
                    : 'border-white/15 hover:border-cyan-400 hover:bg-white/5'
                  // O anel do avatar acompanha o resultado: verde (certo), vermelho (errou)
                  const ring = revealed
                    ? isCorrect ? 'ring-emerald-400' : isChosen ? 'ring-rose-400' : 'ring-white/10'
                    : 'ring-white/25'
                  return (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      disabled={chosen !== null}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left font-semibold transition active:scale-[.98] ${cls}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {hasPhotos && <Avatar name={opt} src={photos[i] ?? null} size={56} ringClass={ring} />}
                        <span className="truncate text-base sm:text-lg">{opt}</span>
                      </span>
                      <span className="flex shrink-0 items-center">
                        {revealed && isCorrect && <Check className="h-5 w-5 text-emerald-400" />}
                        {revealed && isChosen && !isCorrect && <X className="h-5 w-5 text-rose-400" />}
                        {checking && isChosen && <Loader2 className="h-5 w-5 animate-spin" />}
                      </span>
                    </button>
                  )
                })}
              </div>

              {answerError && <p className="mt-3 text-sm text-amber-400">Não foi possível registrar sua resposta. Tente de novo em instantes.</p>}

              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
                  <div className={`mb-1 font-bold ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.correct ? 'Acertou!' : 'Não foi dessa vez.'}
                  </div>
                  {result.explanation && <p className="text-zinc-300">{result.explanation}</p>}
                  {result.sourceLabel && (
                    <p className="mt-2 flex items-center gap-1 text-zinc-400">
                      Fonte:{' '}
                      {result.sourceUrl ? (
                        <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
                          {result.sourceLabel} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : result.sourceLabel}
                    </p>
                  )}
                  <button onClick={next} className="mt-4 w-full rounded-xl bg-white py-3 font-bold text-black active:scale-95">
                    {idx + 1 >= questions.length ? 'Ver resultado' : 'Próxima'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {phase === 'finished' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
          <div className="text-zinc-400">Seu score</div>
          <div className="my-2 text-7xl font-black sm:text-8xl">
            <span className="text-cyan-400">{score}</span>
            <span className="text-rose-400">/{questions.length}</span>
          </div>
          <div className="mb-6 text-xl font-bold">{tier(score, questions.length)}</div>
          <div className="flex flex-col items-center gap-3">
            <StoryShareButton payload={{ kind: 'quiz', score, total: questions.length }} label="Compartilhar meu Score" />
            <button onClick={load} className="inline-flex items-center gap-2 text-zinc-400 underline">
              <RotateCcw className="h-4 w-4" /> Jogar de novo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
