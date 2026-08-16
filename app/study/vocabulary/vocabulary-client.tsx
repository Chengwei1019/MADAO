"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WordCardDeck } from "@/components/WordCardDeck";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function VocabularyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  const [words, setWords] = useState<
    { id: string; word: string; phonetic: string; meaning: string; example: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWords() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("words")
        .select("id, word, phonetic, meaning, example");

      if (!error) {
        const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5);
        setWords(shuffled.slice(0, 10));
      }
      setLoading(false);
    }
    void loadWords();
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
        正在加载单词...
      </main>
    );
  }

  return (
    <WordCardDeck
      words={words}
      onFinish={handleFinish}
      onExit={() => router.push("/")}
    />
  );
}
