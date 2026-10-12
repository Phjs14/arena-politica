'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Download, Loader2, Share2, X } from 'lucide-react'
import { downloadBlob, renderStoryToBlob, shareStory, type StoryPayload } from '@/lib/story'
import { track } from '@/lib/analytics'

export type { StoryPayload }

/**
 * FLUXO EM 2 TOQUES (é o que faz o compartilhar funcionar no celular):
 *  1º toque  -> gera a imagem e mostra uma prévia.
 *  2º toque  -> "Compartilhar" (menu nativo) ou "Baixar imagem".
 * O navegador só libera o menu de compartilhar logo após um toque do usuário, por isso a
 * imagem é gerada ANTES, e o compartilhamento acontece num toque novo.
 */
export default function StoryShareButton({
  payload,
  label = 'Compartilhar no Instagram Story',
}: {
  payload: StoryPayload
  label?: string
}) {
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null)
  const [note, setNote] = useState<string | null>(null) // aviso fora da janela
  const [msg, setMsg] = useState<string | null>(null) // aviso dentro da janela
  const [canShare, setCanShare] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  // Libera a memória da prévia ao fechar/sair
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url)
    }
  }, [preview])

  const shareText =
    payload.kind === 'duel'
      ? `${payload.title} — parcial: ${payload.aLabel} ${payload.aPct.toFixed(1)}% x ${payload.bLabel} ${payload.bPct.toFixed(1)}%`
      : `Fiz ${payload.score}/${payload.total} no quiz "Quem Disse Isso?"`
  const site = process.env.NEXT_PUBLIC_SITE_URL
  // Endereço completo e seguro para usar em link (garante o https:// na frente)
  const siteUrl = site ? (/^https?:\/\//.test(site) ? site : `https://${site}`) : ''
  const filename = `arena-politica-${payload.kind}-${Date.now()}.png`

  async function generate() {
    if (busy) return
    setBusy(true)
    setNote(null)
    setMsg(null)
    try {
      const blob = await renderStoryToBlob(payload)
      setPreview({ blob, url: URL.createObjectURL(blob) })
      track('story_generated', { kind: payload.kind })
    } catch (e) {
      console.error(e)
      setNote('Não foi possível gerar a imagem. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    if (!preview) return
    setMsg(null)
    const out = await shareStory(preview.blob, {
      filename,
      title: 'Arena Política',
      text: site ? `${shareText} ${site}` : shareText,
    })
    track('share_story', { kind: payload.kind, outcome: out })
    if (out === 'shared') setPreview(null)
    else if (out === 'unsupported') setMsg('Seu navegador não permite compartilhar arquivos. Use “Baixar imagem”.')
    else if (out === 'failed') setMsg('Não foi possível abrir o compartilhamento. Use “Baixar imagem”.')
  }

  function handleDownload() {
    if (!preview) return
    downloadBlob(preview.blob, filename)
    track('share_story', { kind: payload.kind, outcome: 'downloaded' })
    setMsg('Imagem baixada! Agora é só postar no seu Story.')
  }

  async function copyLink() {
    if (!siteUrl) return
    try {
      await navigator.clipboard.writeText(siteUrl)
    } catch {
      // plano B para navegadores que bloqueiam a área de transferência
      const ta = document.createElement('textarea')
      ta.value = siteUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    track('copy_link', { kind: payload.kind })
  }

  return (
    <>
      <button
        onClick={generate}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-5 py-3 font-bold text-white shadow-lg shadow-pink-500/20 transition active:scale-95 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
        {busy ? 'Gerando imagem…' : label}
      </button>
      {note && <p className="mt-2 text-sm text-amber-400">{note}</p>}

      {preview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true">
          <div className="relative flex max-h-full w-full max-w-sm flex-col items-center gap-4 overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-4">
            <button
              onClick={() => setPreview(null)}
              aria-label="Fechar"
              className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="pt-2 text-sm font-semibold text-zinc-300">Sua imagem está pronta</p>

            <img
              src={preview.url}
              alt="Prévia do card para Story"
              className="max-h-[55vh] w-auto rounded-xl border border-white/10"
            />

            <div className="flex w-full flex-col gap-2">
              {canShare && (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-5 py-3 font-bold text-white transition active:scale-95"
                >
                  <Share2 className="h-5 w-5" /> Compartilhar
                </button>
              )}
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-bold text-white transition active:scale-95"
              >
                <Download className="h-5 w-5" /> Baixar imagem
              </button>
            </div>

            {siteUrl && (
              <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm font-semibold text-cyan-300 underline"
                >
                  {siteUrl.replace(/^https?:\/\//, '')}
                </a>
                <button
                  onClick={copyLink}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition active:scale-95"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Link copiado!' : 'Copiar link'}
                </button>
                <p className="mt-2 text-xs text-zinc-500">
                  No Instagram, toque no adesivo “Link” do Story e cole o endereço: ele fica clicável para quem assistir.
                </p>
              </div>
            )}

            {msg && <p className="text-center text-sm text-amber-400">{msg}</p>}
            <p className="text-center text-xs text-zinc-500">
              No celular, você também pode segurar o dedo sobre a imagem para salvá-la.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
