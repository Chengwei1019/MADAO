"use client";

import { useState } from "react";

export type FavoriteItem = {
  id: string;
  item_type: string;
  content: string;
  extra: {
    meaning?: string;
    example?: string;
    reference?: string;
    source?: string;
  };
  created_at: string;
};

type FavoritesListProps = {
  items: FavoriteItem[];
  activeType: string;
  onTypeChange: (type: string) => void;
  onRemove: (id: string) => void;
};

const TYPE_TABS = [
  { value: "all", label: "全部" },
  { value: "word", label: "单词" },
  { value: "sentence", label: "例句" },
  { value: "translation", label: "翻译" },
  { value: "essay", label: "作文" },
];

export function FavoritesList({
  items,
  activeType,
  onTypeChange,
  onRemove,
}: FavoritesListProps) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const filtered =
    activeType === "all"
      ? items
      : items.filter((item) => item.item_type === activeType);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTypeChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeType === tab.value
                ? "bg-[var(--brand)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-strong)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-[var(--card)] px-6 py-14 text-center">
          <div className="text-4xl">⭐</div>
          <h3 className="mt-4 text-base font-semibold">还没有收藏</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            在学习时点击星标，就能把内容收藏到这里。
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => {
            if (removedIds.has(item.id)) return null;
            return (
              <div
                key={item.id}
                className="rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--foreground)]">
                      {item.content}
                    </div>
                    {item.extra.meaning ? (
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        {item.extra.meaning}
                      </div>
                    ) : null}
                    {item.extra.example ? (
                      <div className="mt-2 rounded-xl bg-[var(--surface)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
                        {item.extra.example}
                      </div>
                    ) : null}
                    {item.extra.reference ? (
                      <div className="mt-2 rounded-xl bg-[var(--surface)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
                        参考译文：{item.extra.reference}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRemovedIds((prev) => new Set(prev).add(item.id));
                      onRemove(item.id);
                    }}
                    className="shrink-0 text-lg text-[var(--warning)] transition hover:scale-110"
                    title="取消收藏"
                  >
                    ★
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
