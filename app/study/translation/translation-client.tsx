"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TranslationFlow } from "@/components/TranslationFlow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TranslationItem = {
  id: string;
  source_text: string;
  reference_text: string;
};

export function TranslationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  const [item, setItem] = useState<TranslationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("translations")
        .select("id, source_text, reference_text")
        .limit(1)
        .maybeSingle();

      if (!error) {
        setItem(data as TranslationItem | null);
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function handleFinish() {
    if (!userId || !taskId) {
      router.push("/");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("daily_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", userId);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        正在加载翻译材料...
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-xl px-5 py-12 text-center text-[var(--muted)]">
        翻译材料尚未准备，请先在 Supabase 执行 seed 数据。
      </main>
    );
  }

  return (
    <TranslationFlow
      sourceText={item.source_text}
      referenceText={item.reference_text}
      onFinish={handleFinish}
      onExit={() => router.push("/")}
    />
  );
}
