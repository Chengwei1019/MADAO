# Metis 项目规范

## 产品定位

Metis 是面向四六级备考学生的「督学学习工作台」。核心不是自由 AI 聊天，
而是让 AI 完成定级、任务编排和模板化点评。用户每天打开首页，应该立刻知道
今天该学什么、学多少、还剩多少天考试。

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase（认证、Postgres 数据库、历史记录）
- DeepSeek API（兼容 OpenAI SDK，只做任务编排）
- Vercel 部署

## 常用命令

```bash
npm install
npm run dev
npm run build
npm run lint
```

## 目录职责

- `app/`：页面与 API 路由
- `components/`：可复用 UI 组件
- `lib/`：Supabase、AI、类型与业务工具
- `skills/`：教学风格与知识资产，不放进前端构建

## 开发规则

1. 每次只完成一个小功能，改完立即验证。
2. 不修改无关文件，不执行无关重构。
3. 每完成一个稳定阶段就提交 Git，提交信息写清楚变更。
4. 绝不提交 `.env.local`、API Key、Supabase 服务端密钥。
5. 出现环境或依赖错误时，先复现并读取完整错误，不要盲目回退。
6. 所有用户可见文案使用中文，代码注释和标识符使用英文。

## AI 使用边界

- AI 可以：定级、生成任务数量与组合、按模板点评、解释用户错因。
- AI 不可以：实时生成单词释义、真题题目、范文或知识内容。
- AI 输出任务计划时必须保持固定 JSON Schema，内容主体来自数据库词库和题库。
- 教学 skill 是资产，修改前先确认不会破坏原有人设和教学法。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
