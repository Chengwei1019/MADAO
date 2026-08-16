"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WrongAnswersList } from "@/components/WrongAnswersList";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type WrongAnswerItem = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  chosen_index: number;
  explanation: string;
};

export function WrongAnswersClient() {
  const router = useRouter();
  const [items, setItems] = useState<WrongAnswerItem[]>([]);
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
        .from("wrong_answers")
        .select(
          "id, chosen_index, questions(id, question, options, correct_index, explanation)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setItems(
          (data as Array<{
            id: string;
            chosen_index: number;
            questions: Array<{
              id: string;
              question: string;
              options: string[];
              correct_index: number;
              explanation: string | null;
            }>;
          }>)
            .filter((row) => row.questions && row.questions.length > 0)
            .map((row) => {
              const q = row.questions[0];
              return {
                id: row.id,
                question: q.question,
                options: Array.isArray(q.options) ? q.options : [],
                correct_index: q.correct_index,
                chosen_index: row.chosen_index,
                explanation: q.explanation ?? "",
              };
            }),
        );
      }
      setLoading(false);
    }
    void load();
  }, [router]);

  async function handleRemove(wrongAnswerId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("wrong_answers")
      .delete()
      .eq("id", wrongAnswerId);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        正在加载错题本...
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
        <span className="text-sm text-[var(--muted)]">{items.length} 道错题</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">错题本</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        阅读做错的题目会自动收录，点击"已掌握"移出错题本。
      </p>
      <div className="mt-6">
        <WrongAnswersList items={items} onRemove={handleRemove} />
      </div>
    </main>
  );
}
