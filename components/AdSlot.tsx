// Espaço reservado para anúncio (AdSense etc.). Altura fixa evita layout shift (CLS),
// que prejudica SEO e viewability. Troque o conteúdo pelo <ins class="adsbygoogle"> depois.
export default function AdSlot({ label = 'Publicidade' }: { label?: string }) {
  return (
    <div className="mx-auto my-8 flex h-24 w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-zinc-600">
      {label}
    </div>
  )
}
