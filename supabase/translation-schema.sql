create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  source_text text not null,
  reference_text text not null,
  difficulty integer not null default 1,
  source text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.translations enable row level security;

create policy "translations_read_signed_in" on public.translations
  for select using (auth.role() = 'authenticated');
