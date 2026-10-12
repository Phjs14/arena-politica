'use client'

/** Botão para a pessoa mudar de ideia sobre os cookies de estatística (usado na Política de Privacidade). */
export default function ConsentReset() {
  function reset() {
    try { localStorage.removeItem('arena:consent') } catch {}
    window.location.reload() // recarrega: o aviso reaparece e o Analytics deixa de ser carregado
  }
  return (
    <button
      onClick={reset}
      className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95"
    >
      Alterar minha escolha de cookies
    </button>
  )
}
