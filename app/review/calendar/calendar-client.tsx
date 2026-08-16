"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MonthCalendar } from "@/components/MonthCalendar";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function CalendarClient() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());
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

      const { data } = await supabase
        .from("check_ins")
        .select("check_date")
        .eq("user_id", user.id)
        .gte("check_date", `${year - 1}-01-01`);

      setCheckedDates(
        new Set(
          (data ?? []).map((row: { check_date: string }) => row.check_date),
        ),
      );
      setLoading(false);
    }
    void load();
  }, [router, year]);

  const monthlyCount = useMemo(
    () =>
      Array.from(checkedDates).filter((date) =>
        date.startsWith(`${year}-${String(month).padStart(2, "0")}`),
      ).length,
    [checkedDates, year, month],
  );

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        正在加载日历...
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
        <span className="text-sm text-[var(--muted)]">
          本月打卡 {monthlyCount} 天
        </span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">学习日历</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        回顾你的学习足迹，坚持会留下痕迹。
      </p>
      <div className="mt-6">
        <MonthCalendar
          year={year}
          month={month}
          checkedDates={checkedDates}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
      </div>
    </main>
  );
}
