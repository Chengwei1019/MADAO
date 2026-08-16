"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { OnboardingPanel } from "@/components/OnboardingPanel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareCardModal } from "@/components/ShareCardModal";
import {
  CalendarDays,
  ChartNoAxesColumn,
  BookMarked,
  Heart,
  Sparkles,
  Share2,
  Flame,
  AlertTriangle,
  BookOpen,
  Languages,
  PenLine,
  Headphones,
  type LucideIcon,
} from "lucide-react";

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

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calculateStreak(checkDates: string[]) {
  const dateSet = new Set(checkDates);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If today is not checked yet, start counting from yesterday.
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!dateSet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function buildHeatmap(checkDates: string[]) {
  const dateSet = new Set(checkDates);
  const cells: React.ReactNode[] = [];
  const weeks = 14;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7 + 1);

  for (let i = 0; i < weeks * 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    const active = dateSet.has(key);
    cells.push(
      <span
        key={key}
        title={key}
        className={`h-3 w-3 rounded-[4px] ${
          active ? "bg-[var(--brand)]" : "bg-[var(--surface-strong)]"
        }`}
      />,
    );
  }
  return cells;
}

function isBrokenStreak(checkDates: string[]) {
  if (checkDates.length === 0) return false;
  const dateSet = new Set(checkDates);
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateString(yesterday);
  return !dateSet.has(yesterdayKey);
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [assessment, setAssessment] = useState<{
    level: string;
    vocabulary_score: number;
  } | null>(null);
  const [checkIns, setCheckIns] = useState<string[]>([]);
  const [brokenStreak, setBrokenStreak] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planError, setPlanError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(30);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);

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
      const { data: assessmentData } = await supabase
        .from("assessments")
        .select("level, vocabulary_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setAssessment(assessmentData as { level: string; vocabulary_score: number } | null);

      const today = localDateString();
      const { data: todayPlan } = await supabase
        .from("daily_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("plan_date", today)
        .maybeSingle();

      if (todayPlan) {
        const { data: taskData } = await supabase
          .from("daily_tasks")
          .select("id, task_type, title, estimated_minutes, status")
          .eq("plan_id", todayPlan.id)
          .order("order_index");
        setTasks((taskData ?? []) as DailyTask[]);
      } else {
        setTasks([]);
      }

      const since = new Date();
      since.setDate(since.getDate() - 90);
      const { data: checkInData } = await supabase
        .from("check_ins")
        .select("check_date")
        .eq("user_id", user.id)
        .gte("check_date", localDateString(since));
      setCheckIns(
        (checkInData ?? []).map((row: { check_date: string }) => row.check_date),
      );
      setBrokenStreak(
        isBrokenStreak(
          (checkInData ?? []).map(
            (row: { check_date: string }) => row.check_date,
          ),
        ),
      );
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

  function openSettings() {
    setDraftMinutes(profile?.daily_minutes ?? 30);
    setShowSettings(true);
  }

  async function saveSettings() {
    if (!profile) return;
    const minutes = Math.min(180, Math.max(5, draftMinutes));
    setSavingSettings(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ daily_minutes: minutes })
      .eq("id", profile.id);
    setSavingSettings(false);
    if (error) {
      setPlanError(error.message);
      return;
    }
    setShowSettings(false);
    await loadSessionAndProfile();
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
          vocabularyScore: assessment?.vocabulary_score,
          assessmentLevel: assessment?.level,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.plan?.tasks?.length) {
        throw new Error(data.error ?? "Failed to generate a plan.");
      }

      const supabase = createSupabaseBrowserClient();
      const today = localDateString();
      let planId = "";
      let planExists = false;

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
        planExists = true;
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

      if (planExists) {
        throw new Error("今天的计划已经生成过了，请先完成今天的任务。");
      }

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

    const today = localDateString();
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

  function taskStudyHref(task: DailyTask) {
    if (task.task_type === "vocabulary") {
      return `/study/vocabulary?taskId=${task.id}&userId=${profile?.id ?? ""}`;
    }
    if (task.task_type === "reading") {
      return `/study/reading?taskId=${task.id}&userId=${profile?.id ?? ""}`;
    }
    if (task.task_type === "translation") {
      return `/study/translation?taskId=${task.id}&userId=${profile?.id ?? ""}`;
    }
    return "#";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
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

  const streakDays = calculateStreak(checkIns);
  const taskIcons: Record<string, LucideIcon> = {
    vocabulary: BookOpen,
    reading: BookMarked,
    translation: Languages,
    writing: PenLine,
    listening: Headphones,
  };

  return (
    <main className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-[var(--line)] bg-[var(--card)] px-4 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-base font-bold text-white">
            M
          </span>
          <div>
            <div className="text-base font-semibold tracking-tight">Metis</div>
            <div className="text-[11px] text-[var(--muted)]">四六级督学工作台</div>
          </div>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          <span className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
            学习
          </span>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl bg-[var(--brand-soft)] px-3 py-2.5 text-sm font-semibold text-[var(--brand)]"
          >
            <Sparkles size={18} strokeWidth={2} /> 今日任务
          </Link>
          <Link
            href="/assessment"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <ChartNoAxesColumn size={18} strokeWidth={2} /> 词汇测评
          </Link>

          <span className="mb-2 mt-6 px-3 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
            记录
          </span>
          <Link
            href="/review/calendar"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <CalendarDays size={18} strokeWidth={2} /> 学习日历
          </Link>
          <Link
            href="/review/wrong-answers"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <BookMarked size={18} strokeWidth={2} /> 错题本
          </Link>
          <Link
            href="/review/favorites"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <Heart size={18} strokeWidth={2} /> 收藏夹
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="rounded-xl border border-[var(--line)] px-3 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            <span className="flex items-center gap-2">
              <Share2 size={16} strokeWidth={2} /> 分享学习记录
            </span>
          </button>
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold text-white">
              {profile.username.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">
              {profile.username}
            </span>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="rounded-xl px-3 py-2 text-left text-xs text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            每日预算 {profile.daily_minutes} 分钟 · 设置
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl px-3 py-2 text-left text-xs text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            退出登录
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-5 py-8 sm:px-8">
        <header className="mb-8 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-base font-bold text-white">
              M
            </span>
            <div className="text-base font-semibold tracking-tight">Metis</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)]"
            >
              退出
            </button>
          </div>
        </header>

        {brokenStreak ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--warning)] bg-[var(--warning-soft)] px-5 py-4">
            <AlertTriangle size={20} strokeWidth={2} className="text-[var(--warning)]" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--warning)]">
                昨天的学习中断了
              </div>
              <div className="mt-0.5 text-xs text-[var(--warning)]">
                连续记录已经重置，今天重新开始，别让状态溜走。
              </div>
            </div>
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-[var(--radius-card)] bg-[var(--card)] p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--muted)]">
                距离{examLabel}考试
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                <Flame size={15} strokeWidth={2.5} /> 连续 {streakDays} 天
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-semibold tabular-nums tracking-tight">
                {daysLeft}
              </span>
              <span className="text-lg text-[var(--muted)]">天</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">
              每天 {profile.daily_minutes} 分钟，只完成今天该完成的，不需要纠结学什么。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
                {examLabel}备考
              </span>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
                {assessment ? `词汇 ${assessment.level}` : "未测评"}
              </span>
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] bg-[var(--card)] p-7 shadow-[var(--shadow-card)]">
            <div className="text-sm font-medium text-[var(--muted)]">今日完成</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tabular-nums tracking-tight">
                {completedCount}
              </span>
              <span className="text-xl text-[var(--muted)]">/{tasks.length}</span>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[var(--surface-strong)]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all"
                style={{
                  width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="mt-5 border-t border-[var(--surface-strong)] pt-4">
              <div className="mb-2 text-xs text-[var(--muted)]">最近 14 周打卡</div>
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {buildHeatmap(checkIns)}
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">今日任务</h1>
            <span className="text-sm text-[var(--muted)]">
              {tasks.length ? `预计 ${totalMinutes} 分钟` : "等待生成计划"}
            </span>
          </div>

          {tasks.length ? (
            <div className="grid gap-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--card)] p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                    {(() => {
                      const Icon = taskIcons[task.task_type] ?? BookOpen;
                      return <Icon size={19} strokeWidth={2} />;
                    })()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold ${
                        task.status === "completed"
                          ? "text-[var(--muted)] line-through"
                          : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      约 {task.estimated_minutes} 分钟
                    </span>
                  </span>
                  {(task.task_type === "vocabulary" ||
                    task.task_type === "reading" ||
                    task.task_type === "translation") &&
                  task.status !== "completed" ? (
                    <Link
                      href={taskStudyHref(task)}
                      className="rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-strong)]"
                    >
                      开始学习
                    </Link>
                  ) : (
                    <span className="rounded-lg bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--muted)]">
                      {task.status === "completed" ? "已完成" : "待完成"}
                    </span>
                  )}
                  {task.status !== "completed" ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(task.id)}
                      className="rounded-lg bg-[var(--brand-soft)] px-4 py-2 text-xs font-semibold text-[var(--brand)] transition hover:opacity-80"
                    >
                      完成
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--card)] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Sparkles size={24} strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-base font-semibold">今日计划尚未生成</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                AI 会根据你的考试日期和每日时间，自动安排今天要完成的单词、阅读、翻译等任务。
              </p>
              <button
                type="button"
                disabled={generating}
                onClick={handleGeneratePlan}
                className="mt-6 rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
              >
                {generating ? "AI 正在编排今日任务..." : "让 AI 生成今日计划"}
              </button>
              {planError ? (
                <p className="mx-auto mt-4 max-w-md rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
                  {planError}
                </p>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {showSettings ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--card)] p-7 shadow-[var(--shadow-pop)]">
            <h3 className="text-lg font-semibold">每日学习预算</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              调整每天想投入的学习时间，AI 会按这个时长排任务。
            </p>
            <div className="mt-5 flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={draftMinutes}
                onChange={(event) =>
                  setDraftMinutes(Math.max(5, Number(event.target.value) || 5))
                }
                className="w-24 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-center text-lg font-semibold outline-none transition focus:border-[var(--brand)]"
              />
              <span className="text-sm text-[var(--muted)]">分钟 / 天</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDraftMinutes(minutes)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    draftMinutes === minutes
                      ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {minutes} 分钟
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface)]"
              >
                取消
              </button>
              <button
                type="button"
                disabled={savingSettings}
                onClick={saveSettings}
                className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
              >
                {savingSettings ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showShare ? (
        <ShareCardModal
          data={{
            streakDays,
            todayCompleted: completedCount,
            todayTotal: tasks.length,
            examLabel,
            daysLeft,
            vocabularyLevel: assessment?.level ?? "未测评",
          }}
          onClose={() => setShowShare(false)}
        />
      ) : null}
    </main>
  );
}
