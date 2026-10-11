'use client'

import { useMemo, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import Brazil from '@svg-maps/brazil' // mapa geográfico real: 27 UFs, cada uma com seu <path>
import { useArena } from './ArenaProvider'
import { UFS, UF_NAME, UF_SET } from '@/lib/constants'

// O pacote pode vir como módulo CJS: aceitamos os dois formatos de import.
const MAP = ((Brazil as any).default ?? Brazil) as {
  viewBox: string
  locations: { id: string; name: string; path: string }[]
}

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const NAME_TO_UF: Record<string, string> = Object.fromEntries(UFS.map((u) => [norm(u.name), u.uf]))

/** Descobre a sigla (SP, RJ...) de cada pedaço do mapa: pelo id e, se falhar, pelo nome. */
const STATES = MAP.locations
  .map((l) => {
    const id = l.id.toUpperCase()
    const uf = UF_SET.has(id) ? id : NAME_TO_UF[norm(l.name)]
    return uf ? { uf, path: l.path } : null
  })
  .filter(Boolean) as { uf: string; path: string }[]

/**
 * Cor do estado = cor de quem lidera ali; quanto maior a diferença, mais forte a cor.
 * Sem votos = cinza escuro. Empate = cinza médio.
 */
function paint(a: number, b: number, ca: string, cb: string) {
  const total = a + b
  if (total === 0) return { fill: '#1f2937', opacity: 1 }
  if (a === b) return { fill: '#6b7280', opacity: 1 }
  return { fill: a > b ? ca : cb, opacity: 0.5 + 0.5 * (Math.abs(a - b) / total) }
}

export default function BrazilMap() {
  const { duel, rows, selectedUF, setSelectedUF } = useArena()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ uf: string; x: number; y: number } | null>(null)

  const activeUF = hover?.uf ?? selectedUF

  // O estado ativo é desenhado por último para o contorno branco ficar por cima dos vizinhos.
  const ordered = useMemo(
    () => [...STATES].sort((a, b) => Number(a.uf === activeUF) - Number(b.uf === activeUF)),
    [activeUF],
  )

  function track(e: React.PointerEvent, uf: string) {
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    setHover({ uf, x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const tip = hover ? rows[hover.uf] : null
  const tipA = tip?.votes_a ?? 0
  const tipB = tip?.votes_b ?? 0
  const wrapW = wrapRef.current?.clientWidth ?? 400

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-8">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
        <MapPin className="h-4 w-4" /> Mapa da Dominância Regional
      </div>
      <h2 className="mb-5 text-2xl font-black sm:text-3xl">Quem está ganhando em cada estado?</h2>

      <div ref={wrapRef} className="relative mx-auto max-w-xl">
        <svg viewBox={MAP.viewBox} className="w-full" role="group" aria-label="Mapa do Brasil por estado">
          {ordered.map(({ uf, path }) => {
            const r = rows[uf]
            const p = paint(r?.votes_a ?? 0, r?.votes_b ?? 0, duel.side_a_color, duel.side_b_color)
            const isActive = uf === activeUF
            return (
              <path
                key={uf}
                d={path}
                id={uf}
                role="button"
                tabIndex={0}
                aria-label={`${UF_NAME[uf]}: ${(r?.votes_a ?? 0) + (r?.votes_b ?? 0)} votos`}
                fill={p.fill}
                fillOpacity={p.opacity}
                stroke={isActive ? '#ffffff' : '#05060f'}
                strokeWidth={isActive ? 2.5 : 1}
                strokeLinejoin="round"
                style={{ cursor: 'pointer', transition: 'fill .6s, fill-opacity .6s', outline: 'none' }}
                onPointerEnter={(e) => track(e, uf)}
                onPointerMove={(e) => track(e, uf)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)} // no toque, o balão fica até o próximo toque
                onClick={() => setSelectedUF(selectedUF === uf ? null : uf)} // clique/toque filtra o Duelo
                onKeyDown={(e) => e.key === 'Enter' && setSelectedUF(selectedUF === uf ? null : uf)}
              />
            )
          })}
        </svg>

        {/* Balão com os votos, posicionado junto ao mouse/dedo */}
        {hover && (
          <div
            className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-zinc-950/95 p-3 text-xs shadow-xl"
            style={{ left: Math.min(Math.max(hover.x, 92), wrapW - 92), top: Math.max(hover.y - 14, 0) }}
          >
            <div className="mb-1 font-bold text-white">{UF_NAME[hover.uf]}</div>
            <div className="flex justify-between font-semibold" style={{ color: duel.side_a_color }}>
              <span>{duel.side_a_label}</span><span>{tipA.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between font-semibold" style={{ color: duel.side_b_color }}>
              <span>{duel.side_b_label}</span><span>{tipB.toLocaleString('pt-BR')}</span>
            </div>
            <div className="mt-1 border-t border-white/10 pt-1 text-zinc-400">
              {(tipA + tipB).toLocaleString('pt-BR')} votos
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded" style={{ background: duel.side_a_color }} />{duel.side_a_label} lidera</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded" style={{ background: duel.side_b_color }} />{duel.side_b_label} lidera</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-gray-500" />Empate</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded bg-gray-800" />Sem votos</span>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500">Toque em um estado para filtrar o placar do Duelo.</p>
    </div>
  )
}
