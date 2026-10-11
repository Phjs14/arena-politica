-- =====================================================================
-- ARENA POLÍTICA — Schema Supabase (PostgreSQL)
-- Rode no SQL Editor do Supabase. Idempotente o suficiente para dev.
-- =====================================================================
create extension if not exists pgcrypto;

-- Domínio com as 27 UFs: garante integridade em todas as tabelas.
do $$ begin
  create domain public.uf_code as char(2) check (value in (
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
    'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- DUELOS (a "pergunta" ativa do placar)
-- ---------------------------------------------------------------------
create table if not exists public.duels (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  side_a_label  text not null,
  side_b_label  text not null,
  side_a_color  text not null default '#22d3ee',
  side_b_color  text not null default '#f43f5e',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- votes_duel: LOG bruto de votos (auditoria + dedupe).
-- unique(duel_id, voter_hash) = 1 voto por pessoa por duelo, garantido pelo banco.
-- ---------------------------------------------------------------------
create table if not exists public.votes_duel (
  id          bigint generated always as identity primary key,
  duel_id     uuid not null references public.duels(id) on delete cascade,
  state_uf    public.uf_code not null,
  side        char(1) not null check (side in ('A','B')),
  voter_hash  text not null,                 -- sha256(salt + cookie id): nunca guardamos IP puro
  created_at  timestamptz not null default now(),
  unique (duel_id, voter_hash)
);
create index if not exists votes_duel_duel_state_idx on public.votes_duel (duel_id, state_uf);

-- ---------------------------------------------------------------------
-- state_analytics: CONTADORES agregados por duelo + UF.
-- É esta tabela que o Realtime transmite (1 linha por estado = payload minúsculo).
-- ---------------------------------------------------------------------
create table if not exists public.state_analytics (
  duel_id     uuid not null references public.duels(id) on delete cascade,
  state_uf    public.uf_code not null,
  votes_a     bigint not null default 0,
  votes_b     bigint not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (duel_id, state_uf)
);

-- ---------------------------------------------------------------------
-- QUIZ
-- ---------------------------------------------------------------------
create table if not exists public.quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  statement     text not null,                    -- a declaração/proposta
  options       jsonb not null,                   -- ["Opção A","Opção B",...]
  option_images jsonb,                            -- ["/politicos/a.jpg", null, ...] mesma ordem de options
  correct_index smallint not null,                -- NUNCA exposto ao cliente (ver view abaixo)
  source_label  text,                             -- ex.: "Diário Oficial, 12/03/2021"
  source_url    text,
  explanation   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.quiz_responses (
  id            bigint generated always as identity primary key,
  session_id    uuid not null,                    -- gerado no navegador (anônimo)
  question_id   uuid not null references public.quiz_questions(id) on delete cascade,
  chosen_index  smallint not null,
  is_correct    boolean not null,
  created_at    timestamptz not null default now(),
  unique (session_id, question_id)
);
create index if not exists quiz_responses_question_idx on public.quiz_responses (question_id);

-- View pública SEM a resposta correta (a view roda com os direitos do dono,
-- então o anon lê a view mas não consegue ler a tabela base).
create or replace view public.quiz_questions_public as
  select id, statement, options, option_images from public.quiz_questions where is_active;

-- ---------------------------------------------------------------------
-- INCREMENTO ATÔMICO DE VOTO
-- 1) INSERT ... ON CONFLICT DO NOTHING no log -> dedupe resolvido pelo índice único.
-- 2) INSERT ... ON CONFLICT DO UPDATE no contador -> o Postgres trava a linha durante
--    o UPDATE, então dois votos simultâneos nunca perdem incremento (sem race condition).
-- Tudo numa única transação (a função inteira).
-- ---------------------------------------------------------------------
create or replace function public.cast_vote(
  p_duel_id uuid, p_uf public.uf_code, p_side char(1), p_voter_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_rows int;
begin
  if p_side not in ('A','B') then
    raise exception 'lado inválido';
  end if;

  insert into public.votes_duel (duel_id, state_uf, side, voter_hash)
  values (p_duel_id, p_uf, p_side, p_voter_hash)
  on conflict (duel_id, voter_hash) do nothing;

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    return jsonb_build_object('accepted', false, 'reason', 'duplicate');
  end if;

  insert into public.state_analytics as sa (duel_id, state_uf, votes_a, votes_b)
  values (p_duel_id, p_uf, (p_side = 'A')::int, (p_side = 'B')::int)
  on conflict (duel_id, state_uf) do update
    set votes_a    = sa.votes_a + excluded.votes_a,
        votes_b    = sa.votes_b + excluded.votes_b,
        updated_at = now();

  return jsonb_build_object('accepted', true);
end $$;

-- Só o backend (service_role) pode votar: o navegador nunca chama o RPC direto.
revoke all on function public.cast_vote(uuid, public.uf_code, char, text) from public, anon, authenticated;
grant execute on function public.cast_vote(uuid, public.uf_code, char, text) to service_role;

-- ---------------------------------------------------------------------
-- RLS: leitura pública apenas do que precisa; escrita só via service_role.
-- ---------------------------------------------------------------------
alter table public.duels            enable row level security;
alter table public.votes_duel       enable row level security;   -- sem policies = ninguém lê/escreve
alter table public.state_analytics  enable row level security;
alter table public.quiz_questions   enable row level security;   -- sem policies
alter table public.quiz_responses   enable row level security;   -- sem policies

drop policy if exists "duels_public_read" on public.duels;
create policy "duels_public_read" on public.duels for select using (true);

drop policy if exists "analytics_public_read" on public.state_analytics;
create policy "analytics_public_read" on public.state_analytics for select using (true);

grant select on public.quiz_questions_public to anon, authenticated;

-- ---------------------------------------------------------------------
-- REALTIME: transmite mudanças dos contadores via WebSocket.
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.state_analytics;

-- ---------------------------------------------------------------------
-- SEED DE EXEMPLO
-- ATENÇÃO: as perguntas do quiz abaixo são PLACEHOLDERS. Substitua por
-- declarações reais e verificadas (com fonte) antes de publicar.
-- ---------------------------------------------------------------------
insert into public.duels (slug, title, side_a_label, side_b_label, side_a_color, side_b_color)
values ('presidente-2t-flavio-lula', '2º Turno 2026 — Flávio x Lula: quem você apoia?', 'FLÁVIO', 'LULA', '#f5c518', '#dc2626')
on conflict (slug) do nothing;

insert into public.quiz_questions (statement, options, correct_index, source_label, source_url, explanation) values
('[SUBSTITUIR] Declaração verificada nº 1', '["Pessoa A","Pessoa B","Pessoa C"]', 0, '[fonte]', null, '[explicação]'),
('[SUBSTITUIR] Declaração verificada nº 2', '["Pessoa A","Pessoa B","Pessoa C"]', 1, '[fonte]', null, '[explicação]'),
('[SUBSTITUIR] Declaração verificada nº 3', '["Pessoa A","Pessoa B","Pessoa C"]', 2, '[fonte]', null, '[explicação]'),
('[SUBSTITUIR] Declaração verificada nº 4', '["Pessoa A","Pessoa B","Pessoa C"]', 0, '[fonte]', null, '[explicação]'),
('[SUBSTITUIR] Declaração verificada nº 5', '["Pessoa A","Pessoa B","Pessoa C"]', 1, '[fonte]', null, '[explicação]');
