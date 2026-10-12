'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// ID de medição do Google Analytics (começa com G-). Vem da variável NEXT_PUBLIC_GA_ID da Vercel.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Carrega o Google Analytics SOMENTE depois que o visitante clica em "Aceitar" no aviso de cookies.
 * Sem aceite = nenhum script do Google é baixado e nenhum cookie de estatística é criado.
 */
export default function Analytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const read = () => {
      try {
        setAllowed(localStorage.getItem('arena:consent') === 'accepted')
      } catch {
        setAllowed(false)
      }
    }
    read()
    // O aviso de cookies dispara este evento quando a pessoa escolhe.
    window.addEventListener('arena:consent', read)
    return () => window.removeEventListener('arena:consent', read)
  }, [])

  if (!GA_ID || !allowed) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
