'use client'

import { useRef, useState } from 'react'
import { Share2, Loader2 } from 'lucide-react'
import { renderCardToBlob, shareStory, STORY_H, STORY_W } from '@/lib/story'
import { track } from '@/lib/analytics'

/** Conteúdo do card: parcial do Duelo ou resultado do Quiz. */
export type StoryPayload =
  | {
      kind: 'duel'
      title: string
      scopeLabel: string // "Brasil" ou nome do estado
      aLabel: string; bLabel: string
      aColor: string; bColor: string
      aPct: number; bPct: number
      total: number
    }
  | { kind: 'quiz'; score: number; total: number }

/**
 * O card usa APENAS estilos inline com hex: o html2canvas "fotografa" o DOM computado, e estilos
 * inline são o caminho mais previsível. Tamanho fixo 1080x1920 independente da tela do usuário.
 */
function StoryCard({ payload }: { payload: StoryPayload }) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/^https?:\/\//, '')
  const base: React.CSSProperties = {
    width: STORY_W, height: STORY_H, boxSizing: 'border-box', padding: 96,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    fontFamily: 'Inter, system-ui, sans-serif', color: '#fff',
    background:
      'radial-gradient(900px 700px at 0% 0%, rgba(34,211,238,.28), transparent 60%),' +
      'radial-gradient(900px 700px at 100% 100%, rgba(244,63,94,.28), transparent 60%), #05060f',
  }

  return (
    <div style={base}>
      <div style={{ fontSize: 40, letterSpacing: 10, fontWeight: 800, opacity: 0.85 }}>ARENA POLÍTICA</div>

      {payload.kind === 'duel' ? (
        <div>
          <div style={{ fontSize: 40, opacity: 0.7, marginBottom: 24 }}>Parcial · {payload.scopeLabel}</div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.1, marginBottom: 96 }}>{payload.title}</div>

          {[
            { label: payload.aLabel, pct: payload.aPct, color: payload.aColor },
            { label: payload.bLabel, pct: payload.bPct, color: payload.bColor },
          ].map((s) => (
            <div key={s.label} style={{ marginBottom: 64 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <span style={{ fontSize: 56, fontWeight: 800, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: 140, fontWeight: 900, color: s.color }}>{s.pct.toFixed(1)}%</span>
              </div>
              <div style={{ height: 44, borderRadius: 22, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 22 }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 40, opacity: 0.7 }}>{payload.total.toLocaleString('pt-BR')} votos até agora</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, opacity: 0.7, marginBottom: 32 }}>Quem Disse Isso?</div>
          <div style={{ fontSize: 340, fontWeight: 900, lineHeight: 1, color: '#22d3ee' }}>
            {payload.score}<span style={{ fontSize: 160, color: '#f43f5e' }}>/{payload.total}</span>
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, marginTop: 48 }}>Será que você me supera?</div>
        </div>
      )}

      <div style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', opacity: 0.9 }}>
        {site ? `Vote agora em ${site}` : 'Participe da Arena'}
      </div>
    </div>
  )
}

export default function StoryShareButton({
  payload,
  label = 'Compartilhar no Instagram Story',
}: {
  payload: StoryPayload
  label?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function handleClick() {
    if (!cardRef.current || busy) return
    setBusy(true)
    setNote(null)
    try {
      const blob = await renderCardToBlob(cardRef.current)
      const text =
        payload.kind === 'duel'
          ? `${payload.title} — parcial: ${payload.aLabel} ${payload.aPct.toFixed(1)}% x ${payload.bLabel} ${payload.bPct.toFixed(1)}%`
          : `Fiz ${payload.score}/${payload.total} no quiz "Quem Disse Isso?"`
      const out = await shareStory(blob, {
        filename: `arena-politica-${Date.now()}.png`,
        title: 'Arena Política',
        text,
        url: process.env.NEXT_PUBLIC_SITE_URL,
      })
      track('share_story', { kind: payload.kind, outcome: out })
      if (out === 'downloaded') setNote('Imagem baixada! Poste no seu Story.')
    } catch (e) {
      console.error(e)
      setNote('Não foi possível gerar a imagem. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-5 py-3 font-bold text-white shadow-lg shadow-pink-500/20 transition active:scale-95 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
        {busy ? 'Gerando imagem…' : label}
      </button>
      {note && <p className="mt-2 text-sm text-zinc-400">{note}</p>}

      {/* Card oculto fora da tela: precisa estar no DOM (sem display:none) para ser capturado. */}
      <div aria-hidden style={{ position: 'fixed', top: 0, left: -20000, pointerEvents: 'none' }}>
        <div ref={cardRef} style={{ width: STORY_W, height: STORY_H }}>
          <StoryCard payload={payload} />
        </div>
      </div>
    </>
  )
}
