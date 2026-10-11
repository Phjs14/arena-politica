'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser'
import type { Duel, Side, StateRow } from '@/lib/types'

/**
 * ESTADO GLOBAL DA ARENA
 * Um único provider mantém: duelo ativo, contadores por UF (alimentados em tempo real)
 * e a UF selecionada. Duelo e Mapa leem do mesmo lugar -> sempre sincronizados.
 */
interface ArenaCtx {
  duel: Duel
  selectedUF: string | null // null = visão Brasil
  setSelectedUF: (uf: string | null) => void
  rows: Record<string, StateRow>
  getTotals: (uf: string | null) => { a: number; b: number }
  optimisticVote: (uf: string, side: Side) => void
}

const Ctx = createContext<ArenaCtx | null>(null)

export function useArena() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useArena fora do ArenaProvider')
  return v
}

export function ArenaProvider({
  duel,
  initialRows,
  children,
}: {
  duel: Duel
  initialRows: StateRow[]
  children: ReactNode
}) {
  const [rows, setRows] = useState<Record<string, StateRow>>(() =>
    Object.fromEntries(initialRows.map((r) => [r.state_uf, r])),
  )
  const [selectedUF, setSelectedUF] = useState<string | null>(null)

  // ---- Supabase Realtime (WebSocket) ----
  useEffect(() => {
    const supabase = getBrowserClient()

    // Em picos de tráfego chegam MUITOS eventos por segundo. Em vez de re-renderizar a cada
    // evento, acumulamos num buffer e aplicamos em lote a cada 250ms (UI fluida + barato).
    const buffer = new Map<string, StateRow>()
    const flush = setInterval(() => {
      if (buffer.size === 0) return
      const batch = [...buffer.values()]
      buffer.clear()
      setRows((prev) => {
        const next = { ...prev }
        for (const r of batch) next[r.state_uf] = r // eventos trazem valor ABSOLUTO -> idempotente
        return next
      })
    }, 250)

    const channel = supabase
      .channel(`duel:${duel.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'state_analytics', filter: `duel_id=eq.${duel.id}` },
        (payload) => {
          const r = payload.new as StateRow | undefined
          if (r?.state_uf) {
            buffer.set(r.state_uf, {
              state_uf: r.state_uf,
              votes_a: Number(r.votes_a),
              votes_b: Number(r.votes_b),
            })
          }
        },
      )
      .subscribe()

    return () => {
      clearInterval(flush)
      supabase.removeChannel(channel)
    }
  }, [duel.id])

  const getTotals = useCallback(
    (uf: string | null) => {
      if (uf) {
        const r = rows[uf]
        return { a: r?.votes_a ?? 0, b: r?.votes_b ?? 0 }
      }
      let a = 0
      let b = 0
      for (const r of Object.values(rows)) {
        a += r.votes_a
        b += r.votes_b
      }
      return { a, b }
    },
    [rows],
  )

  // Feedback imediato ao votar; o próximo evento realtime sobrescreve com o valor oficial.
  const optimisticVote = useCallback((uf: string, side: Side) => {
    setRows((prev) => {
      const cur = prev[uf] ?? { state_uf: uf, votes_a: 0, votes_b: 0 }
      return {
        ...prev,
        [uf]: {
          ...cur,
          votes_a: cur.votes_a + (side === 'A' ? 1 : 0),
          votes_b: cur.votes_b + (side === 'B' ? 1 : 0),
        },
      }
    })
  }, [])

  const value = useMemo(
    () => ({ duel, selectedUF, setSelectedUF, rows, getTotals, optimisticVote }),
    [duel, selectedUF, rows, getTotals, optimisticVote],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Percentuais A/B com 1 casa decimal; 50/50 quando ainda não há votos. */
export function calcPct(a: number, b: number) {
  const total = a + b
  if (total === 0) return { aPct: 50, bPct: 50, total }
  const aPct = Math.round((a / total) * 1000) / 10
  return { aPct, bPct: Math.round((100 - aPct) * 10) / 10, total }
}
