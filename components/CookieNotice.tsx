'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Aviso de cookies com ESCOLHA real: Aceitar ou Recusar.
 * - Cookies/armazenamento necessários (voto, quiz) funcionam sempre.
 * - Estatísticas (Google Analytics) só carregam se a pessoa aceitar.
 * A escolha fica em localStorage ("arena:consent") e avisa o resto do site pelo evento "arena:consent".
 */
export default function CookieNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('arena:consent')) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function choose(value: 'accepted' | 'declined') {
    try { localStorage.setItem('arena:consent', value) } catch {}
    window.dispatchEvent(new Event('arena:consent'))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-sm text-zinc-300 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <p className="flex-1">
          Usamos cookies necessários para o site funcionar e, se você aceitar, cookies de estatística (Google Analytics)
          para entendermos como o site é usado. Saiba mais na{' '}
          <Link href="/privacidade" className="font-semibold text-white underline">Política de Privacidade</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose('declined')}
            className="rounded-xl border border-white/20 px-5 py-2 font-bold text-white transition active:scale-95"
          >
            Recusar
          </button>
          <button
            onClick={() => choose('accepted')}
            className="rounded-xl bg-white px-5 py-2 font-bold text-black transition active:scale-95"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
