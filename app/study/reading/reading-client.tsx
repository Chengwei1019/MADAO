"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReadingFlow } from "@/components/ReadingFlow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ReadingQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

type ReadingPassage = {
  id: string;
  title: string;
  content: string;
  questions: ReadingQuestion[];
};

export function ReadingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data: passages, error: passageError } = await supabase
        .from("passages")
        .select("id, title, content");

      if (passageError || !passages || passages.length === 0) {
        setLoading(false);
        return;
      }

      const passageData = passages[
        Math.floor(Math.random() * passages.length)
      ] as { id: string; title: string; content: string };

      const { data: questionData } = await supabase
        .from("questions")
        .select("id, question, options, correct_index, explanation")
        .eq("passage_id", passageData.id)
        .order("order_index");

      setPassage({
        id: passageData.id,
        title: passageData.title,
        content: passageData.content,
        questions: (questionData ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correct_index: q.correct_index,
          explanation: q.explanation ?? "",
        })),
      });
      setLoading(false);
    }
    void load();
  }, []);

  async function handleFinish(
    _correctCount: number,
    _totalCount: number,
    wrongAnswers: { questionId: string; chosenIndex: number }[],
  ) {
    const supabase = createSupabaseBrowserClient();
    if (userId && wrongAnswers.length > 0) {
      await supabase.from("wrong_answers").insert(
        wrongAnswers.map((wrong) => ({
          user_id: userId,
          question_id: wrong.questionId,
          chosen_index: wrong.chosenIndex,
        })),
      );
    }
    if (!userId || !taskId) {
      router.push("/");
      return;
    }
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
        正在加载阅读材料...
      </main>
    );
  }

  if (!passage) {
    return (
      <main className="mx-auto max-w-xl px-5 py-12 text-center text-[var(--muted)]">
        阅读材料尚未准备，请先在 Supabase 执行 seed 数据。
      </main>
    );
  }

  return (
    <ReadingFlow
      passage={passage}
      onFinish={handleFinish}
      onExit={() => router.push("/")}
    />
  );
}
