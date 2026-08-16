create table if not exists public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  chosen_index integer not null default -1,
  created_at timestamptz not null default now()
);

create index if not exists wrong_answers_user_idx
  on public.wrong_answers (user_id, created_at);

alter table public.wrong_answers enable row level security;

create policy "wrong_answers_select_own" on public.wrong_answers
  for select using ((select auth.uid()) = user_id);

create policy "wrong_answers_insert_own" on public.wrong_answers
  for insert with check ((select auth.uid()) = user_id);

create policy "wrong_answers_delete_own" on public.wrong_answers
  for delete using ((select auth.uid()) = user_id);
