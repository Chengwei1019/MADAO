"use client";

import { useState } from "react";

export type AssessmentWord = {
  id: string;
  word: string;
  meaning: string;
};

type AssessmentFlowProps = {
  words: AssessmentWord[];
  onComplete: (result: {
    knownCount: number;
    totalCount: number;
    score: number;
    level: string;
  }) => void;
  onExit: () => void;
};

const LEVEL_STEPS = [
  { min: 0, level: "基础", label: "词汇基础待夯实", desc: "先从核心高频词开始，建立稳定词汇量。" },
  { min: 40, level: "进阶", label: "词汇基础一般", desc: "已具备一定基础，建议强化真题高频词。" },
  { min: 70, level: "扎实", label: "词汇基础扎实", desc: "可以把重心放在阅读和听力提速上。" },
];

export function AssessmentFlow({
  words,
  onComplete,
  onExit,
}: AssessmentFlowProps) {
  const [index, setIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  if (!words.length) {
    return (
      <main className="mx-auto max-w-xl px-5 py-12 text-center text-[var(--muted)]">
        词库还没有单词，请先在 Supabase 执行 seed 数据。
      </main>
    );
  }

  const current = words[index];
  const progress = Math.round((index / words.length) * 100);

  function answer(isKnown: boolean) {
    const nextAnswers = [...answers, isKnown];
    const nextKnownCount = knownCount + (isKnown ? 1 : 0);
    setAnswers(nextAnswers);
    setKnownCount(nextKnownCount);

    if (index + 1 >= words.length) {
      const total = words.length;
      const score = Math.round((nextKnownCount / total) * 100);
      const step =
        LEVEL_STEPS.find((s) => score >= s.min) ?? LEVEL_STEPS[0];
      onComplete({
        knownCount: nextKnownCount,
        totalCount: total,
        score,
        level: step.level,
      });
      return;
    }
    setIndex(index + 1);
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← 退出测评
        </button>
        <span className="text-sm text-[var(--muted)]">
          {index + 1} / {words.length}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[var(--card)] px-6 py-8 text-center shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
        <div className="text-sm text-[var(--text-dim)]">你是否认识这个词？</div>
        <div className="mt-5 text-4xl font-semibold tracking-tight">
          {current.word}
        </div>
        <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {current.meaning}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(false)}
          className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)]"
        >
          不认识
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5"
        >
          认识
        </button>
      </div>
    </main>
  );
}
