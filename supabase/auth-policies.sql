-- Run after schema.sql
-- Enables row-level security so each user can only access their own data.

alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.daily_plans enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.user_word_progress enable row level security;
alter table public.check_ins enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);

create policy "assessments_select_own" on public.assessments
  for select using ((select auth.uid()) = user_id);
create policy "assessments_insert_own" on public.assessments
  for insert with check ((select auth.uid()) = user_id);

create policy "plans_select_own" on public.daily_plans
  for select using ((select auth.uid()) = user_id);
create policy "plans_insert_own" on public.daily_plans
  for insert with check ((select auth.uid()) = user_id);
create policy "plans_update_own" on public.daily_plans
  for update using ((select auth.uid()) = user_id);

create policy "tasks_select_own" on public.daily_tasks
  for select using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.daily_tasks
  for insert with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.daily_tasks
  for update using ((select auth.uid()) = user_id);

create policy "word_progress_select_own" on public.user_word_progress
  for select using ((select auth.uid()) = user_id);
create policy "word_progress_insert_own" on public.user_word_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "word_progress_update_own" on public.user_word_progress
  for update using ((select auth.uid()) = user_id);

create policy "check_ins_select_own" on public.check_ins
  for select using ((select auth.uid()) = user_id);
create policy "check_ins_insert_own" on public.check_ins
  for insert with check ((select auth.uid()) = user_id);
create policy "check_ins_update_own" on public.check_ins
  for update using ((select auth.uid()) = user_id);

-- The word bank is read-only content available to signed-in learners.
create policy "words_read_signed_in" on public.words
  for select using (auth.role() = 'authenticated');
