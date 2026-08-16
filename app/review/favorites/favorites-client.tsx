"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FavoritesList } from "@/components/FavoritesList";
import type { FavoriteItem } from "@/components/FavoritesList";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function FavoritesClient() {
  const router = useRouter();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [activeType, setActiveType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("id, item_type, content, extra, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(
          (data as Array<{
            id: string;
            item_type: string;
            content: string;
            extra: FavoriteItem["extra"];
            created_at: string;
          }>).map((row) => ({
            id: row.id,
            item_type: row.item_type,
            content: row.content,
            extra: row.extra ?? {},
            created_at: row.created_at,
          })),
        );
      }
      setLoading(false);
    }
    void load();
  }, [router]);

  async function handleRemove(favoriteId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("favorites").delete().eq("id", favoriteId);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        正在加载收藏夹...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← 返回
        </button>
        <span className="text-sm text-[var(--muted)]">{items.length} 条收藏</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">收藏夹</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        收藏的单词、例句、翻译原句和作文题目都在这里。
      </p>
      <div className="mt-6">
        <FavoritesList
          items={items}
          activeType={activeType}
          onTypeChange={setActiveType}
          onRemove={handleRemove}
        />
      </div>
    </main>
  );
}
