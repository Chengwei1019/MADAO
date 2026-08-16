-- 阅读材料表（文章 + 选择题）
-- 在 Supabase SQL Editor 中运行一次

create table if not exists public.passages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  difficulty integer not null default 1,
  source text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  passage_id uuid not null references public.passages(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0,
  explanation text,
  order_index integer not null default 0
);

alter table public.passages enable row level security;
alter table public.questions enable row level security;

create policy "passages_read_signed_in" on public.passages
  for select using (auth.role() = 'authenticated');

create policy "questions_read_signed_in" on public.questions
  for select using (auth.role() = 'authenticated');
