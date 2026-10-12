import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { SITE } from '@/lib/site'

/** Moldura comum das páginas Sobre / Privacidade / Contato (visual dark igual ao resto do site). */
export default function LegalShell({
  title,
  updated,
  children,
}: {
  title: string
  updated?: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Voltar para a {SITE.name}
      </Link>

      <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur sm:p-10">
        <h1 className="mb-2 text-3xl font-black sm:text-4xl">{title}</h1>
        {updated && <p className="mb-8 text-sm text-zinc-500">Última atualização: {updated}</p>}
        <div className="space-y-4 leading-relaxed text-zinc-300">{children}</div>
      </article>

      <nav className="mt-8 flex flex-wrap justify-center gap-5 text-sm text-zinc-500">
        <Link href="/sobre" className="hover:text-white">Sobre</Link>
        <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
        <Link href="/contato" className="hover:text-white">Contato</Link>
      </nav>
    </main>
  )
}

/** Subtítulo de seção */
export function H2({ children }: { children: ReactNode }) {
  return <h2 className="!mt-8 text-xl font-bold text-white">{children}</h2>
}

/** Lista com marcadores */
export function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6">{children}</ul>
}
