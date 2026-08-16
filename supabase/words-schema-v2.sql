-- 正式版词库表结构设计（供内容规模化时使用）
-- 这是目标结构，包含发音、词性、考频、考纲等完整字段

create table if not exists public.words_v2 (
  id uuid primary key default gen_random_uuid(),

  -- 拼写与音标
  word text not null unique,
  phonetic_uk text,                 -- 英式音标，如 /əˈbændən/
  phonetic_us text,                 -- 美式音标，如 /əˈbændən/

  -- 发音音频
  audio_uk_url text,                -- 英式发音音频 URL
  audio_us_url text,                -- 美式发音音频 URL

  -- 词性与释义
  part_of_speech text,              -- 词性：n. / v. / adj. / adv. / prep.
  meaning_cn text not null,         -- 中文释义
  definition_en text,               -- 英文释义（可选，进阶展示）

  -- 例句
  example_en text,                  -- 英文例句
  example_cn text,                  -- 例句中文翻译

  -- 考纲与考频
  exam_level text not null default 'cet4',  -- cet4 / cet6
  frequency integer not null default 0,     -- 历年真题词频（出现次数）
  frequency_rank text,              -- 频次分级：high / mid / low
  difficulty integer not null default 1,    -- 1-5 难度

  -- 来源与标签
  source text,                      -- 来源：考纲 / 原创 / 开源词典
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists words_v2_frequency_idx
  on public.words_v2 (exam_level, frequency_rank, frequency desc);

create index if not exists words_v2_level_idx
  on public.words_v2 (exam_level, difficulty);

alter table public.words_v2 enable row level security;

create policy "words_v2_read_signed_in" on public.words_v2
  for select using (auth.role() = 'authenticated');

-- 复制旧表数据到新表（保留已有的拼写、释义、例句）
insert into public.words_v2 (word, phonetic_uk, meaning_cn, example_en, difficulty, source, tags)
select word, phonetic, meaning, example, difficulty, source, tags
from public.words
on conflict (word) do nothing;
