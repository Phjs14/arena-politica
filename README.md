# Arena Política

## Setup rápido
1. `npx create-next-app@latest arena-politica --ts --tailwind --app` (ou use esta pasta direto) e copie estes arquivos por cima.
   O alias `@/*` precisa apontar para a raiz (padrão do create-next-app sem `src/`).
2. `npm install`
3. No Supabase: rode `supabase/schema.sql` no SQL Editor.
4. `cp .env.example .env.local` e preencha as chaves (service_role SÓ no servidor).
5. `npm run dev`

## Checklist antes de publicar
- [ ] Trocar as perguntas placeholder do quiz por declarações reais, verificadas e com fonte.
- [ ] Configurar Upstash Redis (o fallback em memória não funciona em serverless multi-instância).
- [ ] Definir `VOTER_HASH_SALT` forte e `NEXT_PUBLIC_SITE_URL`.
- [ ] (Recomendado) Cloudflare Turnstile no POST /api/vote.
- [ ] Trocar `AdSlot` pelo código do AdSense.

## Escala
- Contadores em linha única por (duelo, UF): ~27 linhas "quentes". Se um estado passar de
  centenas de votos/seg, use contadores fragmentados (N linhas por UF somadas na leitura) ou
  agregue votos em Redis e descarregue em lote para o Postgres.
