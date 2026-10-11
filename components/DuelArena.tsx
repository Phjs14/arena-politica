'use client'

import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { Loader2, MapPin, Swords } from 'lucide-react'
import { calcPct, useArena } from './ArenaProvider'
import StoryShareButton from './StoryShare'
import { UFS, UF_NAME } from '@/lib/constants'
import { readableText } from '@/lib/color'
import type { Side } from '@/lib/types'

/** Número que "rola" suavemente até o novo valor (placar vivo). */
function AnimatedNumber({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const mv = useMotionValue(value)
  const [text, setText] = useState(value.toFixed(decimals))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: 'easeOut' })
    const unsub = mv.on('change', (v) => setText(v.toFixed(decimals)))
    return () => { controls.stop(); unsub() }
  }, [value, decimals, mv])
  return <>{text}{suffix}</>
}

// localStorage pode lançar exceção (modo privado/quota): sempre protegido.
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch {} },
}

// Interruptor de emergência: NEXT_PUBLIC_VOTING_ENABLED=false no .env.local pausa a votação.
const VOTING_ENABLED = process.env.NEXT_PUBLIC_VOTING_ENABLED !== 'false'

export default function DuelArena() {
  const { duel, selectedUF, setSelectedUF, getTotals, optimisticVote } = useArena()

  const [myUF, setMyUF] = useState('')
  const [voted, setVoted] = useState<Side | null>(null)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Restaura estado do votante (anti-spam camada 1 + UX)
  useEffect(() => {
    const uf = ls.get('arena:uf')
    if (uf) { setMyUF(uf); setSelectedUF(uf) }
    const v = ls.get(`arena:voted:${duel.id}`)
    if (v === 'A' || v === 'B') setVoted(v)
  }, [duel.id, setSelectedUF])

  const t = getTotals(selectedUF)
  const { aPct, bPct, total } = calcPct(t.a, t.b)
  const scopeLabel = selectedUF ? UF_NAME[selectedUF] : 'Brasil'

  function pickUF(uf: string) {
    setMyUF(uf)
    ls.set('arena:uf', uf)
    setSelectedUF(uf || null)
    setMsg(null)
  }

  async function handleVote(side: Side) {
    if (!VOTING_ENABLED || voted || sending) return
    if (!myUF) { setMsg('Escolha seu estado antes de votar.'); return }
    setSending(true)
    setMsg(null)
    try {
      navigator.vibrate?.(25) // feedback tátil no celular
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId: duel.id, side, uf: myUF }),
      })
      if (res.ok) {
        optimisticVote(myUF, side)
        ls.set(`arena:voted:${duel.id}`, side)
        setVoted(side)
      } else if (res.status === 409) {
        ls.set(`arena:voted:${duel.id}`, side) // servidor diz que já votou neste dispositivo
        setVoted(side)
        setMsg('Você já votou neste duelo.')
      } else if (res.status === 403) {
        setMsg('Votação pausada no momento.')
      } else if (res.status === 429) {
        setMsg('Muitas tentativas. Aguarde um instante.')
      } else {
        setMsg('Erro ao registrar o voto. Tente novamente.')
      }
    } catch {
      setMsg('Sem conexão. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const sides = [
    { side: 'A' as const, label: duel.side_a_label, color: duel.side_a_color, pct: aPct, votes: t.a },
    { side: 'B' as const, label: duel.side_b_label, color: duel.side_b_color, pct: bPct, votes: t.b },
  ]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur sm:p-8">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
        <Swords className="h-4 w-4" /> Duelo Instantâneo
      </div>
      <h2 className="mb-5 text-2xl font-black leading-tight sm:text-4xl">{duel.title}</h2>

      {/* Seletor de estado + escopo do placar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <MapPin className="h-4 w-4" /> Seu estado
          <select
            value={myUF}
            onChange={(e) => pickUF(e.target.value)}
            className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-cyan-400"
          >
            <option value="">Selecione…</option>
            {[...UFS].sort((a, b) => a.name.localeCompare(b.name)).map((u) => (
              <option key={u.uf} value={u.uf}>{u.name}</option>
            ))}
          </select>
        </label>
        <div className="flex rounded-lg border border-white/10 p-1 text-sm">
          <button
            onClick={() => setSelectedUF(null)}
            className={`rounded-md px-3 py-1 transition ${!selectedUF ? 'bg-white text-black' : 'text-zinc-400'}`}
          >Brasil</button>
          <button
            onClick={() => myUF && setSelectedUF(myUF)}
            disabled={!myUF}
            className={`rounded-md px-3 py-1 transition disabled:opacity-40 ${selectedUF ? 'bg-white text-black' : 'text-zinc-400'}`}
          >{selectedUF ? UF_NAME[selectedUF] : 'Meu estado'}</button>
        </div>
      </div>

      {/* Botões gigantes "tap game" */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {sides.map((s) => {
          const mine = voted === s.side
          return (
            <motion.button
              key={s.side}
              whileTap={{ scale: voted ? 1 : 0.94 }}
              whileHover={{ scale: voted ? 1 : 1.02 }}
              onClick={() => handleVote(s.side)}
              disabled={!!voted || sending || !VOTING_ENABLED}
              style={{
                background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                color: readableText(s.color), // texto preto em fundo claro, branco em fundo escuro
                boxShadow: mine ? `0 0 0 4px #fff, 0 10px 50px ${s.color}88` : `0 10px 40px ${s.color}44`,
              }}
              className="relative flex h-40 flex-col items-center justify-center rounded-3xl p-4 text-center sm:h-56 disabled:cursor-default"
            >
              <span className="text-2xl font-black sm:text-5xl">{s.label}</span>
              {sending && <Loader2 className="mt-2 h-6 w-6 animate-spin" />}
              {mine && <span className="mt-2 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white">SEU VOTO</span>}
            </motion.button>
          )
        })}
      </div>

      {msg && <p className="mt-3 text-sm text-amber-400">{msg}</p>}
      {!VOTING_ENABLED && <p className="mt-3 text-sm text-amber-400">Votação pausada no momento. O placar abaixo mostra os votos já registrados.</p>}

      {/* Placar com barras animadas */}
      <div className="mt-8 space-y-4">
        <div className="flex items-baseline justify-between text-sm text-zinc-400">
          <span>Placar · {scopeLabel}</span>
          <span><AnimatedNumber value={total} /> votos</span>
        </div>

        {sides.map((s) => (
          <div key={s.side}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-bold" style={{ color: s.color }}>{s.label}</span>
              <span className="text-3xl font-black tabular-nums sm:text-5xl" style={{ color: s.color }}>
                <AnimatedNumber value={s.pct} decimals={1} suffix="%" />
              </span>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: s.color }}
                initial={false}
                animate={{ width: `${s.pct}%` }}
                transition={{ type: 'spring', stiffness: 110, damping: 20 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <StoryShareButton
          payload={{
            kind: 'duel', title: duel.title, scopeLabel,
            aLabel: duel.side_a_label, bLabel: duel.side_b_label,
            aColor: duel.side_a_color, bColor: duel.side_b_color,
            aPct, bPct, total,
          }}
        />
      </div>
    </div>
  )
}
