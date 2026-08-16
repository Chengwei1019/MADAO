"use client";

import { useState } from "react";

export type WrongAnswerItem = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  chosen_index: number;
  explanation: string;
};

type WrongAnswersListProps = {
  items: WrongAnswerItem[];
  onRemove: (id: string) => void;
};

export function WrongAnswersList({
  items,
  onRemove,
}: WrongAnswersListProps) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--card)] px-6 py-14 text-center">
        <div className="text-4xl">✅</div>
        <h3 className="mt-4 text-base font-semibold">还没有错题</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          阅读做错的题目会自动收录到这里。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item, index) => {
        const removed = removedIds.has(item.id);
        if (removed) return null;
        return (
          <div
            key={item.id}
            className="rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {index + 1}. {item.question}
              </div>
              <button
                type="button"
                onClick={() => {
                  setRemovedIds((prev) => new Set(prev).add(item.id));
                  onRemove(item.id);
                }}
                className="shrink-0 rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:bg-[var(--surface-strong)]"
              >
                已掌握
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {item.options.map((option, oi) => {
                const isCorrect = oi === item.correct_index;
                const isChosen = oi === item.chosen_index;
                let style = "border-[var(--line)]";
                if (isCorrect) {
                  style = "border-[var(--success)] bg-[var(--success-soft)]";
                } else if (isChosen) {
                  style = "border-[var(--danger)] bg-[var(--danger-soft)]";
                }
                return (
                  <div
                    key={oi}
                    className={`rounded-xl border p-3 text-sm ${style}`}
                  >
                    <span className="mr-2 font-semibold">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {option}
                    {isChosen && !isCorrect ? "（你的答案）" : ""}
                    {isCorrect ? "（正确答案）" : ""}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-xl bg-[var(--surface)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
              {item.explanation}
            </div>
          </div>
        );
      })}
    </div>
  );
}
