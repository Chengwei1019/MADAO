create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null,               -- word / sentence / translation / essay
  content text not null,                 -- 收藏的主体内容
  extra jsonb not null default '{}'::jsonb,  -- 补充信息（释义、参考译文、例句等）
  created_at timestamptz not null default now(),
  unique (user_id, item_type, content)
);

create index if not exists favorites_user_idx
  on public.favorites (user_id, item_type, created_at);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select using ((select auth.uid()) = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert with check ((select auth.uid()) = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete using ((select auth.uid()) = user_id);
