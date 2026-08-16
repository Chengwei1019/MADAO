# Metis

面向四六级备考学生的 AI 督学学习工作台。

当前版本是第一版工程骨架：本地可运行，首页已经包含今日简报、考试倒计时、
备考进度和今日任务流。后续再接 Supabase 用户系统、测评和 AI 任务编排。

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

## 环境变量

复制 `.env.example` 为 `.env.local`，填写：

- DeepSeek API Key
- Supabase Project URL
- Supabase Anon Key

`.env.local` 已加入 `.gitignore`，不要提交到仓库。

## 工作流

1. VS Code + Codex 本地开发
2. 小步提交到 GitHub
3. Vercel 监听 GitHub 自动部署
4. Supabase 提供数据库与用户认证
5. 手机 Codex App 远程改码和验收
