"use client";

import { useState } from "react";

export type WordCard = {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
};

type WordCardDeckProps = {
  words: WordCard[];
  onFinish: (knownCount: number) => void;
  onExit: () => void;
};

export function WordCardDeck({
  words,
  onFinish,
  onExit,
}: WordCardDeckProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [lastKnown, setLastKnown] = useState(true);
  const [finished, setFinished] = useState(false);

  if (!words.length) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-12 text-center text-[var(--muted)]">
        词库还没有单词，请先在 Supabase 执行 seed 数据。
      </main>
    );
  }

  const current = words[index];
  const progress = Math.round((index / words.length) * 100);

  function revealChoice(isKnown: boolean) {
    setLastKnown(isKnown);
    setRevealed(true);
  }

  function nextCard() {
    const nextKnown = known + (lastKnown ? 1 : 0);
    setKnown(nextKnown);
    setRevealed(false);
    if (index + 1 >= words.length) {
      setFinished(true);
      onFinish(nextKnown);
      return;
    }
    setIndex(index + 1);
  }

  if (finished) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-[0_20px_60px_rgba(30,35,55,0.08)]">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-4 text-2xl font-semibold">本轮完成</h1>
          <p className="mt-3 text-[var(--muted)]">
            认识 {known} 个，待巩固 {words.length - known} 个。
          </p>
          <button
            type="button"
            onClick={onExit}
            className="mt-7 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            返回今日任务
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← 返回
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

      <div className="mt-8 flex min-h-[320px] w-full flex-col items-center justify-center rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-10 text-center shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
        <div className="text-4xl font-semibold tracking-tight">
          {current.word}
        </div>
        <div className="mt-2 text-sm text-[var(--muted)]">{current.phonetic}</div>

        {revealed ? (
          <div className="mt-8">
            <div className="text-lg font-medium text-[var(--foreground)]">
              {current.meaning}
            </div>
            <div className="mt-4 rounded-2xl bg-[var(--surface)] px-5 py-4 text-left text-sm leading-7 text-[var(--muted)]">
              {current.example}
            </div>
          </div>
        ) : (
          <div className="mt-8 text-sm text-[var(--text-dim)]">
            先判断认不认识，再看释义
          </div>
        )}
      </div>

      {revealed ? (
        <button
          type="button"
          onClick={nextCard}
          className="mt-6 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5"
        >
          {index + 1 >= words.length ? "查看结果" : "下一词"}
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => revealChoice(false)}
            className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface)]"
          >
            不认识
          </button>
          <button
            type="button"
            onClick={() => revealChoice(true)}
            className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5"
          >
            认识
          </button>
        </div>
      )}
    </main>
  );
}
