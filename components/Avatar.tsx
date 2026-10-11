'use client'

import { useState } from 'react'

/** Matiz (0-360) estável a partir do nome: o mesmo nome sempre gera a mesma cor. */
function hueOf(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

function initialsOf(name: string) {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

/**
 * Avatar circular. Se a foto não existir ou falhar ao carregar (onError),
 * mostra automaticamente as iniciais num círculo colorido — o quiz nunca "quebra".
 */
export default function Avatar({
  name,
  src,
  size = 48,
  ringClass = 'ring-white/20',
}: {
  name: string
  src?: string | null
  size?: number
  ringClass?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImg = !!src && !failed
  const h = hueOf(name)

  return (
    <span
      className={`relative inline-flex shrink-0 select-none overflow-hidden rounded-full ring-2 transition-shadow ${ringClass}`}
      style={{ width: size, height: size }}
    >
      {showImg ? (
        // <img> simples (e não next/image) para aceitar fotos locais OU de qualquer domínio sem configuração extra.
        <img
          src={src!}
          alt={name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-black text-white"
          style={{
            fontSize: size * 0.38,
            background: `linear-gradient(135deg, hsl(${h} 70% 45%), hsl(${(h + 40) % 360} 70% 28%))`,
          }}
        >
          {initialsOf(name)}
        </span>
      )}
    </span>
  )
}
