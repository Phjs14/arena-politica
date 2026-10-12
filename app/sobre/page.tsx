import type { Metadata } from 'next'
import LegalShell, { H2, UL } from '@/components/LegalShell'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Sobre — ${SITE.name}`,
  description: 'Conheça a Arena Política: duelo, quiz e mapa interativo sobre política brasileira.',
}

export default function SobrePage() {
  return (
    <LegalShell title={`Sobre a ${SITE.name}`}>
      <p>
        A {SITE.name} é um projeto de entretenimento e informação sobre a política brasileira. Aqui você joga um quiz
        com falas de políticos, acompanha um placar interativo e explora um mapa do Brasil por estado.
      </p>

      {SITE.independent && (
        <p>
          O site não tem ligação com partido político, candidato ou campanha eleitoral, e não recebe recursos deles.
        </p>
      )}

      <H2>O quiz “Quem Disse Isso?”</H2>
      <UL>
        <li>Cada pergunta traz uma fala atribuída a um político, com a fonte e o link da reportagem ou do perfil oficial.</li>
        <li>Reproduzimos apenas trechos curtos, com o objetivo de informar e de dar contexto ao jogo.</li>
        <li>As alternativas incluem políticos de diferentes partidos, e o jogo não expressa opinião sobre nenhum deles.</li>
        <li>Se você achar que alguma citação está errada, incompleta ou sem o contexto devido, escreva para a gente (veja a página de Contato). Revisamos e corrigimos ou removemos o que for necessário.</li>
      </UL>

      <H2>Placares e mapa</H2>
      <p>
        Os números exibidos refletem apenas os votos de quem participa do site. Não são pesquisa de opinião nem
        levantamento estatístico, e não devem ser usados para prever resultados de eleições.
      </p>

      <H2>Créditos</H2>
      <UL>
        <li>Mapa do Brasil: MapSVG, licença CC BY 4.0, distribuído no pacote @svg-maps/brazil.</li>
        <li>Fotos dos políticos: cada imagem é usada conforme a licença do seu autor, com crédito quando exigido.</li>
      </UL>

      <H2>Fale com a gente</H2>
      <p>
        Dúvidas, sugestões ou pedidos de correção: <a className="font-semibold text-white underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalShell>
  )
}
