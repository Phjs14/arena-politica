import type { Metadata } from 'next'
import LegalShell, { H2, UL } from '@/components/LegalShell'
import { SITE } from '@/lib/site'
import ConsentReset from '@/components/ConsentReset'

export const metadata: Metadata = {
  title: `Política de Privacidade — ${SITE.name}`,
  description: 'Como a Arena Política trata dados pessoais, cookies e armazenamento local (LGPD).',
}

export default function PrivacidadePage() {
  const mail = (
    <a className="font-semibold text-white underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
  )

  return (
    <LegalShell title="Política de Privacidade" updated={SITE.updatedAt}>
      <p>
        Esta política explica como a {SITE.name} (“site”) trata informações das pessoas que o visitam, em linha com a
        Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).
      </p>

      <H2>1. Quem é o responsável</H2>
      <p>
        O responsável (controlador) pelo tratamento dos dados é {SITE.owner}. Contato para assuntos de privacidade: {mail}.
      </p>

      <H2>2. Quais dados tratamos</H2>
      <p>O site não pede nome, e-mail, CPF, telefone nem cadastro. Tratamos apenas o necessário para funcionar:</p>
      <UL>
        <li><strong className="text-white">Votos no duelo:</strong> o estado que você escolheu, o lado votado, a data e a hora, e um identificador anônimo (um código embaralhado gerado a partir de um cookie do seu navegador).</li>
        <li><strong className="text-white">Respostas do quiz:</strong> um identificador anônimo de sessão, as alternativas escolhidas e se acertou ou errou.</li>
        <li><strong className="text-white">Endereço IP:</strong> usado apenas de forma temporária para limitar abusos e votos automatizados. Ele não é gravado junto aos votos e é descartado em até 24 horas.</li>
        <li><strong className="text-white">Dados técnicos de acesso:</strong> registros gerados pela hospedagem (como data, página acessada e tipo de navegador), usados para segurança e estabilidade.</li>
        <li><strong className="text-white">Estatísticas de uso (Google Analytics):</strong> somente se você aceitar, o Google Analytics registra de forma agregada as páginas acessadas, o tempo no site, o tipo de aparelho e de navegador, a região aproximada e ações como concluir o quiz ou compartilhar. Não enviamos ao Google o lado em que você votou nem as suas respostas individuais do quiz.</li>
      </UL>

      <H2>3. Cookies e armazenamento no seu navegador</H2>
      <UL>
        <li><strong className="text-white">Cookie “arena_vid” (necessário):</strong> identifica anonimamente o seu navegador para evitar votos repetidos. Dura até 1 ano.</li>
        <li><strong className="text-white">Armazenamento local:</strong> guardamos no seu navegador o estado escolhido, se você já votou, um código de sessão do quiz e a sua resposta ao aviso de cookies.</li>
        <li><strong className="text-white">Cookies de estatística (Google Analytics):</strong> só são criados se você clicar em “Aceitar” no aviso de cookies. Se recusar, o Google Analytics não é carregado.</li>
        <li><strong className="text-white">Cookies de terceiros (publicidade):</strong> quando o site exibir anúncios, o Google e seus parceiros podem usar cookies para mostrar anúncios (veja a seção 6).</li>
      </UL>
      <p>Você pode apagar cookies e dados do site nas configurações do seu navegador. Isso pode fazer o site esquecer que você já votou.</p>
      <div><ConsentReset /></div>

      <H2>4. Para que usamos os dados e em que base legal</H2>
      <UL>
        <li>Operar o duelo, o quiz e o mapa (execução do serviço que você solicitou ao usar o site).</li>
        <li>Prevenir fraudes, spam e votos automatizados (legítimo interesse e segurança).</li>
        <li>Gerar números agregados, como o total de votos por estado, sem identificar ninguém.</li>
        <li>Entender como o site é usado para melhorá-lo, por meio de estatísticas (mediante o seu consentimento).</li>
        <li>Exibir anúncios, quando houver (consentimento, por meio do aviso de cookies e das ferramentas do Google).</li>
      </UL>

      <H2>5. Com quem os dados passam</H2>
      <p>Usamos prestadores de serviço (operadores) para manter o site no ar:</p>
      <UL>
        <li><strong className="text-white">Supabase:</strong> banco de dados onde ficam votos, respostas e perguntas.</li>
        <li><strong className="text-white">Vercel:</strong> hospedagem do site.</li>
        <li><strong className="text-white">Upstash:</strong> contadores temporários usados para limitar abusos.</li>
        <li><strong className="text-white">Google (Analytics):</strong> estatísticas de uso do site, somente se você aceitar os cookies.</li>
        <li><strong className="text-white">Google (AdSense):</strong> exibição de anúncios, quando ativada.</li>
      </UL>
      <p>
        Esses serviços podem usar servidores fora do Brasil. Nesses casos, buscamos prestadores que adotem medidas de
        segurança compatíveis com a LGPD. Não vendemos dados pessoais.
      </p>

      <H2>6. Publicidade</H2>
      <p>
        O site poderá exibir anúncios do Google AdSense. O Google, como fornecedor externo, usa cookies para veicular
        anúncios com base em visitas anteriores a este e a outros sites. Você pode saber mais em{' '}
        <a className="underline" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">como o Google usa dados de sites parceiros</a>{' '}
        e gerenciar a personalização de anúncios em{' '}
        <a className="underline" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
      </p>

      <H2>7. Por quanto tempo guardamos</H2>
      <UL>
        <li>Votos e respostas do quiz: enquanto o serviço existir, de forma anônima e agregada.</li>
        <li>Endereço IP em contadores de segurança: até 24 horas.</li>
        <li>Cookie “arena_vid”: até 1 ano, ou até você apagá-lo.</li>
        <li>Dados do Google Analytics: até 14 meses, conforme a retenção configurada em nossa conta.</li>
      </UL>

      <H2>8. Seus direitos</H2>
      <p>
        Pela LGPD, você pode pedir confirmação de que tratamos seus dados, acesso, correção, anonimização, eliminação,
        informações sobre compartilhamento e a revogação do consentimento. Como não identificamos as pessoas, podemos
        precisar do identificador do seu navegador para localizar um dado específico, e isso pode não ser possível
        se você apagou o cookie. Escreva para {mail}.
      </p>

      <H2>9. Segurança</H2>
      <p>
        Adotamos medidas como conexão criptografada (HTTPS), identificadores embaralhados em vez de dados puros e
        acesso restrito ao banco de dados. Nenhum sistema é totalmente imune a falhas, mas trabalhamos para reduzir riscos.
      </p>

      <H2>10. Crianças e adolescentes</H2>
      <p>O site não é direcionado a menores de 13 anos e não coleta intencionalmente dados pessoais deles.</p>

      <H2>11. Mudanças nesta política</H2>
      <p>Podemos atualizar este texto. A data da última revisão aparece no topo da página.</p>

      <H2>12. Contato</H2>
      <p>Dúvidas sobre esta política ou sobre seus dados: {mail}.</p>
    </LegalShell>
  )
}
