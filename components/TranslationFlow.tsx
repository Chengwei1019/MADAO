"use client";

import { useState } from "react";

type TranslationFlowProps = {
  sourceText: string;
  referenceText: string;
  onFinish: () => void;
  onExit: () => void;
};

export function TranslationFlow({
  sourceText,
  referenceText,
  onFinish,
  onExit,
}: TranslationFlowProps) {
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← 返回
        </button>
        <span className="text-sm text-[var(--muted)]">汉译英</span>
      </div>

      <article className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
        <div className="text-sm font-medium tracking-wide text-[#4f6df5]">
          原文
        </div>
        <p className="mt-4 text-lg leading-8 text-[var(--foreground)]">{sourceText}</p>
      </article>

      <section className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
          你的译文
        </label>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={submitted}
          placeholder="用英语写下你的翻译..."
          className="min-h-[160px] w-full resize-none rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-5 text-[15px] leading-7 text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] disabled:bg-[var(--surface)]"
        />
      </section>

      {!submitted ? (
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => setSubmitted(true)}
          className="mt-6 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          对照参考译文
        </button>
      ) : (
        <>
          <section className="mt-6 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-8">
            <div className="text-sm font-medium tracking-wide text-[#4f6df5]">
              参考译文
            </div>
            <p className="mt-4 text-lg leading-8 text-[var(--foreground)]">
              {referenceText}
            </p>
          </section>
          <button
            type="button"
            onClick={onFinish}
            className="mt-6 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            完成，返回今日任务
          </button>
        </>
      )}
    </main>
  );
}
