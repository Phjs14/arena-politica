'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Aviso simples de cookies/armazenamento local (LGPD). Aparece uma vez e lembra a escolha.
 * ATENÇÃO: é um aviso informativo básico. Quando os anúncios forem ativados, o Google pode
 * exigir uma ferramenta de consentimento própria (CMP) — veja as regras do AdSense.
 */
export default function CookieNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('arena:cookies-ok')) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function accept() {
    try { localStorage.setItem('arena:cookies-ok', '1') } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-sm text-zinc-300 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <p className="flex-1">
          Usamos cookies e armazenamento local para o funcionamento do site, para evitar abusos e, quando houver
          anúncios, para exibi-los. Saiba mais na nossa{' '}
          <Link href="/privacidade" className="font-semibold text-white underline">Política de Privacidade</Link>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-xl bg-white px-5 py-2 font-bold text-black transition active:scale-95"
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
