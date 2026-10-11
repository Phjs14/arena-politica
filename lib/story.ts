import html2canvas from 'html2canvas-pro' // fork do html2canvas com suporte a cores modernas (oklch/lab)

export const STORY_W = 1080
export const STORY_H = 1920

/**
 * Converte o elemento (que DEVE ter exatamente 1080x1920 px de layout) em PNG.
 * scale: 1 -> saída final = 1080x1920 px, o tamanho ideal para Stories.
 */
export async function renderCardToBlob(el: HTMLElement): Promise<Blob> {
  // Garante que as fontes carregaram antes de "fotografar"
  if (document.fonts?.ready) await document.fonts.ready

  const canvas = await html2canvas(el, {
    width: STORY_W,
    height: STORY_H,
    windowWidth: STORY_W,
    windowHeight: STORY_H,
    scale: 1,
    backgroundColor: '#05060f',
    useCORS: true,
    logging: false,
  })

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar PNG'))), 'image/png', 1),
  )
}

export type ShareOutcome = 'shared' | 'cancelled' | 'downloaded'

/**
 * Abre o menu nativo de compartilhamento (iOS/Android) com a imagem anexada.
 * O usuário escolhe "Stories" do Instagram no próprio menu.
 * Fallback (desktop / navegador sem suporte a arquivos): baixa o PNG.
 */
export async function shareStory(
  blob: Blob,
  opts: { filename: string; title: string; text: string; url?: string },
): Promise<ShareOutcome> {
  const file = new File([blob], opts.filename, { type: 'image/png' })

  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: opts.title, text: opts.text, url: opts.url })
      return 'shared'
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled' // usuário fechou o menu
      // qualquer outro erro: cai no download
    }
  }

  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = opts.filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(href), 10_000)
  return 'downloaded'
}
