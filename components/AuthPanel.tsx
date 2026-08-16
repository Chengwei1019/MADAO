"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthPanelProps = {
  onSignedIn: () => void;
};

export function AuthPanel({ onSignedIn }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("register");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const supabase = createSupabaseBrowserClient();
    const result =
      mode === "register"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (!result.data.user) {
      setError("Please check your email to confirm the account.");
      return;
    }

    onSignedIn();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_20px_60px_rgba(30,35,55,0.08)]"
      >
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-bold text-white">
            M
          </span>
          <div>
            <div className="text-lg font-semibold tracking-tight">Metis</div>
            <div className="text-xs text-[var(--muted)]">四六级督学工作台</div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "register" ? "创建学习账户" : "继续今天的学习"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          用邮箱登录，Metis 会记住你的考试目标、打卡记录和学习进度。
        </p>

        <label className="mt-7 block text-sm font-medium text-[var(--foreground)]">
          邮箱
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[#fbfbfc] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-[var(--foreground)]">
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="至少 6 位"
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[#fbfbfc] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "处理中..." : mode === "register" ? "创建账户" : "登录"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
          className="mt-4 w-full rounded-2xl border border-[var(--line)] px-5 py-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface)]"
        >
          {mode === "register" ? "已有账户，去登录" : "没有账户，去注册"}
        </button>
      </form>
    </main>
  );
}
