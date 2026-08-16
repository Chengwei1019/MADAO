"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OnboardingPanelProps = {
  userId: string;
  email: string;
  onComplete: () => void;
};

const EXAM_OPTIONS = [
  { value: "cet4", label: "大学英语四级 CET-4" },
  { value: "cet6", label: "大学英语六级 CET-6" },
];

const MINUTE_OPTIONS = [
  { value: 15, label: "15 分钟 · 碎片学习" },
  { value: 30, label: "30 分钟 · 日常坚持" },
  { value: 60, label: "60 分钟 · 冲刺模式" },
];

export function OnboardingPanel({
  userId,
  email,
  onComplete,
}: OnboardingPanelProps) {
  const [examType, setExamType] = useState("cet4");
  const [examDate, setExamDate] = useState("2026-12-13");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const supabase = createSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      username: email.split("@")[0],
      exam_type: examType,
      exam_date: examDate,
      daily_minutes: dailyMinutes,
    });

    setBusy(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    onComplete();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_20px_60px_rgba(30,35,55,0.08)]"
      >
        <div className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-sm font-medium text-[#4f6df5]">
          第一步 · 告诉 Metis 你的考试目标
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          你正在准备哪场考试？
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          只需设置一次，后续每日任务都会围绕这个目标自动调整。
        </p>

        <fieldset className="mt-6 grid gap-3 sm:grid-cols-2">
          {EXAM_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                examType === option.value
                  ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                  : "border-[var(--line)] bg-[var(--card)]"
              }`}
            >
              <input
                type="radio"
                name="examType"
                value={option.value}
                checked={examType === option.value}
                onChange={() => setExamType(option.value)}
                className="accent-[#4f6df5]"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </fieldset>

        <label className="mt-6 block text-sm font-medium text-[var(--foreground)]">
          预计考试日期
          <input
            type="date"
            value={examDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setExamDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[#fbfbfc] px-4 py-3 text-sm outline-none focus:border-[var(--brand)]"
          />
        </label>

        <fieldset className="mt-5 grid gap-3">
          {MINUTE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                dailyMinutes === option.value
                  ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                  : "border-[var(--line)] bg-[var(--card)]"
              }`}
            >
              <input
                type="radio"
                name="dailyMinutes"
                value={option.value}
                checked={dailyMinutes === option.value}
                onChange={() => setDailyMinutes(Number(option.value))}
                className="accent-[#4f6df5]"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </fieldset>

        {error ? (
          <p className="mt-5 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-7 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "正在创建计划..." : "完成设置，进入工作台"}
        </button>
      </form>
    </main>
  );
}
