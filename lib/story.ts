/**
 * GERADOR DO CARD DE STORY (1080x1920) — desenhado direto num <canvas>.
 * Por que canvas e não "fotografar" o HTML (html2canvas)?
 *  - Não depende do scroll da página, de fontes, de CSS moderno nem de elementos fora da tela:
 *    o resultado é igual em qualquer aparelho.
 *  - É mais rápido e não tem dependência extra.
 */
export const STORY_W = 1080
export const STORY_H = 1920

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

const W = STORY_W
const H = STORY_H
const PAD = 96
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number) {
  ctx.font = `${weight} ${size}px ${FONT}`
}

/** Retângulo com cantos arredondados (usado nas barras). */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Escreve texto quebrando em linhas; devolve a próxima posição Y livre. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  let line = ''
  let cy = y
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy)
      line = word
      cy += lineH
    } else {
      line = test
    }
  }
  if (line) {
    ctx.fillText(line, x, cy)
    cy += lineH
  }
  return cy
}

function paintBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#05060f'
  ctx.fillRect(0, 0, W, H)
  const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 1000)
  g1.addColorStop(0, 'rgba(34,211,238,0.30)')
  g1.addColorStop(1, 'rgba(34,211,238,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, W, H)
  const g2 = ctx.createRadialGradient(W, H, 0, W, H, 1100)
  g2.addColorStop(0, 'rgba(244,63,94,0.30)')
  g2.addColorStop(1, 'rgba(244,63,94,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, W, H)
}

/** Desenha o card e devolve um PNG de exatamente 1080x1920. */
export async function renderStoryToBlob(p: StoryPayload): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível neste navegador')

  paintBackground(ctx)
  ctx.textBaseline = 'alphabetic'

  // Cabeçalho
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  setFont(ctx, 800, 40)
  ;(ctx as any).letterSpacing = '8px' // ignorado em navegadores que não suportam
  ctx.fillText('ARENA POLÍTICA', PAD, 150)
  ;(ctx as any).letterSpacing = '0px'

  if (p.kind === 'duel') {
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    setFont(ctx, 500, 40)
    ctx.fillText(`Parcial · ${p.scopeLabel}`, PAD, 330)

    ctx.fillStyle = '#ffffff'
    setFont(ctx, 900, 76)
    let y = wrapText(ctx, p.title, PAD, 430, W - PAD * 2, 90)
    y = Math.max(y + 100, 900)

    const trackW = W - PAD * 2
    const sides = [
      { label: p.aLabel, pct: p.aPct, color: p.aColor },
      { label: p.bLabel, pct: p.bPct, color: p.bColor },
    ]
    for (const s of sides) {
      ctx.fillStyle = s.color
      ctx.textAlign = 'left'
      setFont(ctx, 800, 56)
      ctx.fillText(s.label, PAD, y)
      ctx.textAlign = 'right'
      setFont(ctx, 900, 140)
      ctx.fillText(`${s.pct.toFixed(1)}%`, W - PAD, y)

      const by = y + 50
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      roundRect(ctx, PAD, by, trackW, 44, 22)
      ctx.fill()
      if (s.pct > 0) {
        ctx.fillStyle = s.color
        roundRect(ctx, PAD, by, Math.max(44, (trackW * s.pct) / 100), 44, 22)
        ctx.fill()
      }
      y = by + 44 + 130
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    setFont(ctx, 500, 40)
    ctx.fillText(`${p.total.toLocaleString('pt-BR')} votos até agora`, PAD, y)
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    setFont(ctx, 500, 52)
    ctx.fillText('Quem Disse Isso?', W / 2, 700)

    // Placar "7/10": dois tamanhos de fonte lado a lado, centralizados
    const scoreTxt = String(p.score)
    const totalTxt = `/${p.total}`
    setFont(ctx, 900, 340)
    const w1 = ctx.measureText(scoreTxt).width
    setFont(ctx, 900, 160)
    const w2 = ctx.measureText(totalTxt).width
    const sx = (W - w1 - w2) / 2
    ctx.textAlign = 'left'
    ctx.fillStyle = '#22d3ee'
    setFont(ctx, 900, 340)
    ctx.fillText(scoreTxt, sx, 1050)
    ctx.fillStyle = '#f43f5e'
    setFont(ctx, 900, 160)
    ctx.fillText(totalTxt, sx + w1, 1050)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    setFont(ctx, 800, 64)
    ctx.fillText('Será que você me supera?', W / 2, 1250)
  }

  // Rodapé
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/^https?:\/\//, '')
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  setFont(ctx, 700, 48)
  ctx.fillText(site ? `Participe em ${site}` : 'Participe da Arena', W / 2, H - 120)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar PNG'))), 'image/png'),
  )
}

export type ShareOutcome = 'shared' | 'cancelled' | 'unsupported' | 'failed'

/**
 * Abre o menu nativo de compartilhamento (celular) com a imagem anexada.
 * IMPORTANTE: precisa ser chamada DIRETO de um toque do usuário (sem esperas longas antes),
 * senão o navegador bloqueia. Por isso o componente gera a imagem primeiro e só depois
 * mostra o botão "Compartilhar".
 */
export async function shareStory(
  blob: Blob,
  opts: { filename: string; title: string; text: string },
): Promise<ShareOutcome> {
  const file = new File([blob], opts.filename, { type: 'image/png' })
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare?.({ files: [file] })) {
    return 'unsupported'
  }
  try {
    await navigator.share({ files: [file], title: opts.title, text: opts.text })
    return 'shared'
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') return 'cancelled' // usuário fechou o menu
    return 'failed'
  }
}

/** Baixa a imagem (funciona no computador e na maioria dos celulares). */
export function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 10_000)
}
