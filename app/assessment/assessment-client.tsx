"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentFlow } from "@/components/AssessmentFlow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AssessmentWord = {
  id: string;
  word: string;
  meaning: string;
};

export function AssessmentClient() {
  const router = useRouter();
  const [words, setWords] = useState<AssessmentWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<{
    knownCount: number;
    totalCount: number;
    score: number;
    level: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

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
      setUserId(user.id);

      const { data, error } = await supabase
        .from("words")
        .select("id, word, meaning");

      if (!error) {
        const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5);
        setWords(shuffled.slice(0, 20) as AssessmentWord[]);
      }
      setLoading(false);
    }
    void load();
  }, [router]);

  async function handleComplete(
    assessment: {
      knownCount: number;
      totalCount: number;
      score: number;
      level: string;
    },
  ) {
    setResult(assessment);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();
    await supabase.from("assessments").insert({
      user_id: userId,
      level: assessment.level,
      vocabulary_score: assessment.score,
      summary: {
        knownCount: assessment.knownCount,
        totalCount: assessment.totalCount,
      },
    });

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        正在准备测评...
      </main>
    );
  }

  if (result) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-sm rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-[0_20px_60px_rgba(30,35,55,0.08)]">
          <div className="text-4xl">📊</div>
          <h1 className="mt-4 text-2xl font-semibold">你的词汇水平：{result.level}</h1>
          <p className="mt-3 text-[var(--muted)]">
            认识 {result.knownCount} / {result.totalCount} 个词，正确率 {result.score}%
          </p>
          <div className="mt-6 rounded-2xl bg-[var(--surface)] px-5 py-4 text-sm leading-6 text-[var(--muted)]">
            {result.score >= 70
              ? "基础扎实，后续任务会适当提升难度，把重心放在阅读和听力。"
              : result.score >= 40
                ? "基础一般，后续任务会先夯实高频词，再逐步提升。"
                : "我们从核心高频词开始，稳定积累词汇量。"}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => router.push("/")}
            className="mt-7 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            {saving ? "保存中..." : "返回工作台"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <AssessmentFlow
      words={words}
      onComplete={handleComplete}
      onExit={() => router.push("/")}
    />
  );
}
