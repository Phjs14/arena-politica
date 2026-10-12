import type { Metadata } from 'next'
import LegalShell, { H2, UL } from '@/components/LegalShell'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Contato — ${SITE.name}`,
  description: 'Fale com a equipe da Arena Política: correções, dúvidas e solicitações de privacidade.',
}

export default function ContatoPage() {
  return (
    <LegalShell title="Contato">
      <p>
        Para falar com a {SITE.name}, escreva para{' '}
        <a className="font-semibold text-white underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <H2>Sobre o que você pode escrever</H2>
      <UL>
        <li><strong className="text-white">Correção de citação:</strong> informe qual pergunta, o que está errado e, se possível, o link de uma fonte confiável. Analisamos e corrigimos ou retiramos o conteúdo.</li>
        <li><strong className="text-white">Privacidade e LGPD:</strong> pedidos sobre seus dados (veja a Política de Privacidade).</li>
        <li><strong className="text-white">Fotos e direitos de imagem:</strong> se você é autor ou retratado e quer pedir crédito ou remoção de uma imagem.</li>
        <li><strong className="text-white">Parcerias, imprensa e publicidade.</strong></li>
        <li><strong className="text-white">Sugestões e problemas técnicos.</strong></li>
      </UL>

      <p className="text-sm text-zinc-500">
        Responsável pelo site: {SITE.owner}.
      </p>
    </LegalShell>
  )
}
