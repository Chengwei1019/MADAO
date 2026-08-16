# Metis 项目交接文档

> 用途：让新的 Codex 会话（或任何开发者）快速、准确地接手本项目。
> 新会话开始时，先读本文件，再读实际代码。不要凭训练数据猜 Next.js 用法，
> 本项目使用 Next.js 16（App Router + Turbopack），API 可能与旧版不同。

## 一、产品定位（最重要，勿偏离）

Metis 是面向四六级备考学生的「AI 督学学习工作台」，**不是自由 AI 聊天工具**。

核心原则：**AI 只做编排，不做讲题。** AI 只负责三件事：

1. 定级（根据测评结果）
2. 生成每日任务组合（输出固定 JSON）
3. 模板化点评

单词释义、阅读文章、翻译题目、作文范文等**知识内容全部预制在数据库**，
AI 绝不实时生成知识内容。用户打开首页，3 秒内知道今天该学什么、学多少、还剩多少天考试。

## 二、技术栈与运行

- Next.js 16.3.1（App Router + Turbopack）
- React 19.2.8 + TypeScript 5.9.3
- Tailwind CSS 4.3.3（通过 `@tailwindcss/postcss`）
- Supabase（认证 + Postgres 数据库 + RLS）
- DeepSeek API（OpenAI 兼容 SDK）
- Vercel 部署

常用命令：

```bash
npm install
npm run dev      # 本地开发，localhost:3000
npm run build    # 生产构建（改代码后必跑，验证类型）
npm run lint
```

## 三、目录职责

```
app/
  page.tsx                    首页（今日简报、任务列表、入口聚合，最大文件）
  layout.tsx                  根布局
  globals.css                 主题变量（浅色/暗色两套 CSS 变量）
  api/daily-plan/route.ts     DeepSeek 生成每日计划的 API 路由
  assessment/                 词汇测评定级页
  study/vocabulary/           单词卡片学习页
  study/reading/              阅读做题页
  study/translation/          翻译练习页
  review/wrong-answers/       错题本页
  review/favorites/           收藏夹页
  review/calendar/            月度学习日历页
components/
  AuthPanel.tsx               登录注册
  OnboardingPanel.tsx         首次考试目标设置
  AssessmentFlow.tsx          测评流程组件
  WordCardDeck.tsx            单词卡片流
  ReadingFlow.tsx             阅读答题流程
  TranslationFlow.tsx         翻译练习流程
  WrongAnswersList.tsx        错题列表
  FavoritesList.tsx           收藏列表
  FavoriteStar.tsx            星标收藏按钮（复用）
  MonthCalendar.tsx           月历组件
  ShareCardModal.tsx          分享卡片弹窗
  ThemeToggle.tsx             暗色模式切换按钮
lib/
  ai.ts                       DeepSeek 编排逻辑（固定 JSON Schema）
  share-card.ts               Canvas 分享卡片绘制
  supabase/client.ts          浏览器端 Supabase 客户端
skills/                       教学风格资产（不参与前端构建）
supabase/                     所有数据库 SQL 文件
```

## 四、数据库结构（Supabase）

所有表都在 `supabase/schema.sql` 及各专项 schema 文件里。关键表：

| 表 | 用途 | 关键字段 |
|----|------|---------|
| `profiles` | 用户信息 | exam_type, exam_date, daily_minutes |
| `assessments` | 测评定级 | level, vocabulary_score |
| `daily_plans` | 每日计划 | user_id + plan_date 唯一 |
| `daily_tasks` | 计划内任务 | task_type, title, status, order_index |
| `words_v2` | **正式词库** | word, phonetic_uk/us, audio_uk/us_url, part_of_speech, meaning_cn, definition_en, example_en/cn, exam_level, frequency, difficulty |
| `words` | 旧词库（已迁移到 v2） | 遗留，可保留 |
| `passages` | 阅读文章 | title, content, difficulty |
| `questions` | 阅读题 | passage_id, options(jsonb), correct_index |
| `translations` | 翻译题 | source_text, reference_text |
| `check_ins` | 打卡 | check_date, completed_count |
| `wrong_answers` | 错题本 | question_id, chosen_index |
| `favorites` | 收藏夹 | item_type(word/sentence/translation/essay), content, extra(jsonb) |

**重要**：数据库变更需要在 Supabase Dashboard 的 SQL Editor 手动执行。
我（Codex）会把 SQL 文件放到用户桌面，由用户执行。RLS 已开启，每个用户只能访问自己的数据。

## 五、已完成功能清单

1. 邮箱注册登录（Supabase Auth）
2. 考试目标设置（四级/六级、考试日期、每日预算）
3. 词汇测评定级（基础/进阶/扎实）
4. AI 每日任务编排（DeepSeek 生成 JSON）
5. 单词卡片学习（随机取词、认识/不认识、收藏单词/例句）
6. 阅读做题（随机取文、选择题、错题自动入库）
7. 翻译练习（汉译英、收藏原句）
8. 打卡 + 连续天数 + 热力图 + 断签提醒
9. 错题本 / 收藏夹 / 月度日历 / 分享卡片
10. 每日预算自由输入（5-180 分钟）+ 暗色模式

## 六、未完成模块（下一步）

- **写作**：作文题目 + 范文。`favorites` 表已预留 `essay` 类型，`ai.ts` 已支持 `writing` 任务类型。
- **听力**：需要音频资源，最重，最后做。`ai.ts` 已支持 `listening` 类型，但无音频和学习页。

## 七、关键设计决策（不要推翻）

1. AI 只编排不讲题，知识内容全部预制数据库。
2. 内容是资产不是代码，存 Supabase，不硬编码在组件里。
3. 词库用考纲词表（公开可批量导入）；真题题目可用，但解析必须自写，不搬出版社文字。
4. 音频第一版跳过，规模化时用开源音频库补 `audio_uk_url` / `audio_us_url`。
5. 颜色统一用 `globals.css` 里的 CSS 变量（`var(--brand)` 等），不要硬编码 hex，否则暗色模式失效。
6. 任务按当天 `daily_plans` 过滤，防止历史任务混入；重复生成计划要拦截。

## 八、环境注意点

- Codex 沙箱权限会在会话间变化（时禁网络、时禁写入）。构建失败先看是否 EPERM 权限问题。
- 桌面目录 `C:\Users\lcw10\Desktop\METIS重启` 不一定在可写白名单里，写入失败时需用户开权限或改放到工作区。
- 数据库 SQL 变更需用户在 Supabase SQL Editor 手动执行，我会把文件放桌面。
- `.env.local` 已 gitignore，含 Supabase URL、Anon Key、DeepSeek Key，绝不提交。

## 九、关键凭证

- Supabase URL：`https://ryhrfggzjgjaljtwaglb.supabase.co`
- Supabase Anon Key：见 `.env.local` 的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- DeepSeek：`deepseek-chat`，base URL 见 `.env.local`
- GitHub 仓库：`Chengwei1019/MADAO`，主分支 `main`

## 十、开发规范（同 AGENTS.md）

1. 每次只做一个小功能，改完立即 `npm run build` 验证。
2. 不修改无关文件，不做无关重构。
3. 每完成稳定阶段提交 Git，commit 信息写清楚。
4. 用户可见文案用中文，代码标识符和注释用英文。
5. 先读文件再改，不凭记忆猜 API。
