import { createClient } from '@supabase/supabase-js'
import { Flame } from 'lucide-react'
import { ArenaProvider } from '@/components/ArenaProvider'
import DuelArena from '@/components/DuelArena'
import BrazilMap from '@/components/BrazilMap'
import Quiz from '@/components/Quiz'
import AdSlot from '@/components/AdSlot'
import type { Duel, StateRow } from '@/lib/types'

// ISR: o HTML é regenerado no máx. a cada 10s; os números "vivos" vêm via Realtime no cliente.
export const revalidate = 10

/** Busca no servidor o duelo ativo + contadores iniciais (SSR = primeira pintura já com dados). */
async function loadArena(): Promise<{ duel: Duel; rows: StateRow[] } | null> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  })
  const { data: duel } = await sb
    .from('duels')
    .select('id, slug, title, side_a_label, side_b_label, side_a_color, side_b_color')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!duel) return null

  const { data: rows } = await sb.from('state_analytics').select('state_uf, votes_a, votes_b').eq('duel_id', duel.id)
  return {
    duel: duel as Duel,
    rows: (rows ?? []).map((r) => ({ state_uf: r.state_uf, votes_a: Number(r.votes_a), votes_b: Number(r.votes_b) })),
  }
}

export default async function Home() {
  const arena = await loadArena()

  return (
    <>
      {/* Navegação fixa com scroll suave (âncoras + scroll-behavior: smooth no CSS) */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#05060f]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <a href="#topo" className="flex items-center gap-2 font-black tracking-widest">
            <Flame className="h-5 w-5 text-rose-500" /> ARENA
          </a>
          <div className="flex gap-4 text-sm font-semibold text-zinc-400">
            <a href="#duelo" className="hover:text-white">Duelo</a>
            <a href="#mapa" className="hover:text-white">Mapa</a>
            <a href="#quiz" className="hover:text-white">Quiz</a>
          </div>
        </div>
      </nav>

      <main id="topo" className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <header className="text-center">
          <h1 className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-500 bg-clip-text text-5xl font-black text-transparent sm:text-7xl">
            Arena Política
          </h1>
          <p className="mt-3 text-zinc-400">Vote, jogue e veja o Brasil se posicionar em tempo real.</p>
        </header>

        {arena ? (
          <ArenaProvider duel={arena.duel} initialRows={arena.rows}>
            <section id="duelo"><DuelArena /></section>
            <AdSlot />
            <section id="mapa"><BrazilMap /></section>
          </ArenaProvider>
        ) : (
          <p className="text-center text-zinc-500">Nenhum duelo ativo no momento. Volte em breve!</p>
        )}

        <AdSlot />
        <section id="quiz"><Quiz /></section>
      </main>

      <footer className="py-10 text-center text-xs text-zinc-600">
        <p>Votos anônimos e não científicos — não representam pesquisa de opinião.</p>
        <p className="mt-1">Mapa: MapSVG (CC BY 4.0) via @svg-maps/brazil. Fotos: créditos conforme a licença de cada imagem.</p>
        <nav className="mt-4 flex justify-center gap-5 text-sm font-semibold text-zinc-500">
          <a href="/sobre" className="hover:text-white">Sobre</a>
          <a href="/privacidade" className="hover:text-white">Privacidade</a>
          <a href="/contato" className="hover:text-white">Contato</a>
        </nav>
      </footer>
    </>
  )
}
