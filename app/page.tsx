"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  exam_type: "cet4" | "cet6";
  exam_date: string;
  daily_minutes: number;
};

type DailyTask = {
  id: string;
  task_type: string;
  title: string;
  estimated_minutes: number;
  status: string;
};

type PlannedTaskView = {
  task_type: string;
  title: string;
  estimated_minutes: number;
};

function remainingDays(target: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(`${target}T00:00:00`);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [generating, setGenerating] = useState(false);
  const [planError, setPlanError] = useState("");

  const loadSessionAndProfile = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setEmail(user.email ?? "");

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, exam_type, exam_date, daily_minutes")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(profileData as Profile | null);

    if (profileData) {
      const { data: taskData } = await supabase
        .from("daily_tasks")
        .select("id, task_type, title, estimated_minutes, status")
        .eq("user_id", user.id)
        .order("order_index")
        .limit(10);
      setTasks((taskData ?? []) as DailyTask[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSessionAndProfile();
  }, [loadSessionAndProfile]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setProfile(null);
    setTasks([]);
    setUserId("");
    setEmail("");
  }

  async function handleGeneratePlan() {
    if (!profile) return;

    setGenerating(true);
    setPlanError("");

    try {
      const response = await fetch("/api/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate: profile.exam_date,
          level: profile.exam_type,
          minutesAvailable: profile.daily_minutes,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.plan?.tasks?.length) {
        throw new Error(data.error ?? "Failed to generate a plan.");
      }

      const supabase = createSupabaseBrowserClient();
      const today = new Date().toISOString().slice(0, 10);
      let planId = "";

      const { data: planData, error: planInsertError } = await supabase
        .from("daily_plans")
        .insert({
          user_id: profile.id,
          plan_date: today,
          total_minutes: data.plan.total_minutes,
          status: "active",
          generated_by: "deepseek",
        })
        .select("id")
        .single();

      if (planInsertError) {
        if (planInsertError.code !== "23505") throw planInsertError;
        const { data: existingPlan } = await supabase
          .from("daily_plans")
          .select("id")
          .eq("user_id", profile.id)
          .eq("plan_date", today)
          .maybeSingle();
        planId = existingPlan?.id ?? "";
      } else {
        planId = planData?.id ?? "";
      }

      if (!planId) throw new Error("Could not create the daily plan.");

      const { error: tasksInsertError } = await supabase
        .from("daily_tasks")
        .insert(
          data.plan.tasks.map((task: PlannedTaskView, index: number) => ({
            plan_id: planId,
            user_id: profile.id,
            task_type: task.task_type,
            title: task.title,
            estimated_minutes: task.estimated_minutes,
            status: "pending",
            order_index: index,
          })),
        );

      if (tasksInsertError) throw tasksInsertError;
      await loadSessionAndProfile();
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "生成计划失败。");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCompleteTask(taskId: string) {
    if (!profile) return;

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("daily_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", profile.id);

    if (updateError) {
      setPlanError(updateError.message);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: existingCheckIn } = await supabase
      .from("check_ins")
      .select("id, completed_count")
      .eq("user_id", profile.id)
      .eq("check_date", today)
      .maybeSingle();

    const nextCompletedCount = Math.min(
      tasks.length,
      (existingCheckIn?.completed_count ?? 0) + 1,
    );

    if (existingCheckIn) {
      await supabase
        .from("check_ins")
        .update({
          completed_count: nextCompletedCount,
          total_count: tasks.length,
        })
        .eq("id", existingCheckIn.id);
    } else {
      await supabase.from("check_ins").insert({
        user_id: profile.id,
        check_date: today,
        completed_count: 1,
        total_count: tasks.length,
      });
    }

    await loadSessionAndProfile();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[#737a88]">
        正在加载你的学习工作台...
      </main>
    );
  }

  if (!userId) {
    return <AuthPanel onSignedIn={loadSessionAndProfile} />;
  }

  if (!profile) {
    return (
      <OnboardingPanel
        userId={userId}
        email={email}
        onComplete={loadSessionAndProfile}
      />
    );
  }

  const daysLeft = remainingDays(profile.exam_date);
  const examLabel = profile.exam_type === "cet4" ? "四级" : "六级";
  const totalMinutes = tasks.reduce(
    (sum, task) => sum + task.estimated_minutes,
    0,
  );
  const completedCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const taskIcons: Record<string, string> = {
    vocabulary: "词",
    reading: "读",
    translation: "译",
    writing: "写",
    listening: "听",
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4f6df5] text-lg font-bold text-white">
            M
          </span>
          <div>
            <div className="text-lg font-semibold tracking-tight">Metis</div>
            <div className="text-xs text-[#737a88]">四六级督学工作台</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-[#e4e7ed] bg-white px-4 py-2 text-sm font-medium text-[#737a88] transition hover:bg-[#f7f8fa]"
        >
          {profile.username} · 退出
        </button>
      </header>

      <section className="mt-9 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[28px] border border-[#e4e7ed] bg-white p-7 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
          <div className="text-sm font-medium tracking-wide text-[#4f6df5]">
            今日简报
          </div>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            距离{examLabel}考试还有 {daysLeft} 天。
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#737a88]">
            你的每日学习预算是 {profile.daily_minutes} 分钟。打开工作台，
            只完成今天该完成的，不需要纠结学什么。
          </p>
          <div className="mt-6 flex gap-3">
            <span className="rounded-2xl bg-[#e9edff] px-4 py-2 text-sm font-semibold text-[#4f6df5]">
              {examLabel}备考
            </span>
            <span className="rounded-2xl bg-[#f7f8fa] px-4 py-2 text-sm font-medium text-[#737a88]">
              今日预算 {profile.daily_minutes} 分钟
            </span>
          </div>
        </article>

        <article className="rounded-[28px] border border-[#e4e7ed] bg-white p-7 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-[#737a88]">今日完成</div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">
                {completedCount}
                <span className="text-xl text-[#737a88]">/{tasks.length}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-[#e9edff] px-3 py-2 text-sm font-semibold text-[#4f6df5]">
              预计 {totalMinutes} 分钟
            </div>
          </div>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#eef0f4]">
            <div
              className="h-full rounded-full bg-[#4f6df5] transition-all"
              style={{
                width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="mt-5 text-sm leading-6 text-[#737a88]">
            每完成一项任务，都会离你的考试目标更近一步。
          </p>
        </article>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">今日任务</h2>
          <span className="text-sm text-[#737a88]">
            {tasks.length ? "任务来自你的每日计划" : "等待生成计划"}
          </span>
        </div>

        {tasks.length ? (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-2xl border border-[#e4e7ed] bg-white p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9edff] text-sm font-semibold text-[#4f6df5]">
                  {taskIcons[task.task_type] ?? "学"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {task.title}
                  </span>
                  <span className="mt-1 block text-xs text-[#737a88]">
                    约 {task.estimated_minutes} 分钟
                  </span>
                </span>
                <span className="rounded-xl bg-[#f7f8fa] px-3 py-2 text-xs font-medium text-[#737a88]">
                  {task.status === "completed" ? "已完成" : "待完成"}
                </span>
                {task.status !== "completed" ? (
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(task.id)}
                    className="rounded-xl bg-[#e9edff] px-4 py-2 text-xs font-semibold text-[#4f6df5] transition hover:bg-[#dde4ff]"
                  >
                    完成
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#d9dde6] bg-white px-6 py-10 text-center">
            <div className="text-3xl">📋</div>
            <h3 className="mt-4 text-base font-semibold">今日计划尚未生成</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737a88]">
              AI 会根据你的考试日期和每日时间，自动安排今天要完成的单词、阅读、翻译等任务。
            </p>
            <button
              type="button"
              disabled={generating}
              onClick={handleGeneratePlan}
              className="mt-6 rounded-2xl bg-[#4f6df5] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {generating ? "AI 正在编排今日任务..." : "让 AI 生成今日计划"}
            </button>
            {planError ? (
              <p className="mx-auto mt-4 max-w-md rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {planError}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
