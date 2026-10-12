// Envia eventos para o Google Analytics SOMENTE se ele estiver carregado
// (ou seja, se o visitante aceitou os cookies). Se não estiver, não faz nada.
//
// REGRA DE PRIVACIDADE: nunca enviar ao Google em quem a pessoa votou nem as respostas
// individuais do quiz (opinião política é dado sensível na LGPD). Só eventos genéricos.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function track(event: string, params?: Record<string, string | number | boolean>) {
  try {
    window.gtag?.('event', event, params)
  } catch {
    // análise nunca pode quebrar o site
  }
}
