/**
 * DADOS DO SITE — EDITE AQUI (é o único arquivo que você precisa mexer nas páginas legais).
 * Tudo que está marcado com "TROQUE" precisa ser preenchido com informação verdadeira.
 */
export const SITE = {
  name: 'Arena Política',

  // Vem da variável NEXT_PUBLIC_SITE_URL da Vercel (sem a barra no final)
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),

  // TROQUE: e-mail real e monitorado (ex.: criar um Gmail só para o site). É por ele que
  // as pessoas pedem correção de citações e exercem direitos da LGPD.
  email: 'santospedrodossantos71@gmail.com',

  // TROQUE: seu nome completo (pessoa física) ou razão social + CNPJ (empresa)
  owner: 'Pedro Hennrique de Jesus Santos',

  // Só mude para true se for VERDADE: o site não tem ligação com partido, candidato ou campanha.
  // (Com true, a página "Sobre" passa a exibir essa declaração.)
  independent: true,

  // Data da última revisão dos textos legais
  updatedAt: '12 de outubro de 2026',
}
