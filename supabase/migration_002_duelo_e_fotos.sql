-- =====================================================================
-- ATUALIZAÇÃO 2 — rode UMA vez no SQL Editor do Supabase
-- (para quem já rodou o schema.sql antes)
-- =====================================================================

-- 1) Quiz: coluna para as fotos das opções (mesma ordem de "options")
alter table public.quiz_questions add column if not exists option_images jsonb;

create or replace view public.quiz_questions_public as
  select id, statement, options, option_images
  from public.quiz_questions
  where is_active;

grant select on public.quiz_questions_public to anon, authenticated;

-- 2) Duelo principal: Flávio x Lula (o antigo fica guardado, só desativado)
update public.duels set is_active = false where slug = 'aprovacao-geral';

insert into public.duels (slug, title, side_a_label, side_b_label, side_a_color, side_b_color, is_active)
values ('presidente-2t-flavio-lula', '2º Turno 2026 — Flávio x Lula: quem você apoia?',
        'FLÁVIO', 'LULA', '#f5c518', '#dc2626', true)
on conflict (slug) do update
  set title = excluded.title,
      side_a_label = excluded.side_a_label, side_b_label = excluded.side_b_label,
      side_a_color = excluded.side_a_color, side_b_color = excluded.side_b_color,
      is_active = true;

-- 3) EXEMPLO de pergunta com fotos (descomente e preencha com citação REAL e verificada)
-- insert into public.quiz_questions
--   (statement, options, option_images, correct_index, source_label, source_url, explanation)
-- values (
--   '<<CITAÇÃO VERIFICADA AQUI>>',
--   '["Flávio Bolsonaro","Lula"]',
--   '["/politicos/flavio-bolsonaro.jpg","/politicos/lula.jpg"]',
--   0,                       -- 0 = primeira opção é a correta; 1 = segunda
--   '<<veículo, data>>', '<<link da fonte>>', '<<contexto da fala>>'
-- );

-- 4) EXEMPLO para colocar fotos numa pergunta que já existe:
-- update public.quiz_questions
--   set options = '["Flávio Bolsonaro","Lula"]',
--       option_images = '["/politicos/flavio-bolsonaro.jpg","/politicos/lula.jpg"]'
-- where statement like '%trecho da pergunta%';
