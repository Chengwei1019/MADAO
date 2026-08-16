"use client";

import { useEffect, useState } from "react";

const EXAM_DATE = new Date("2026-12-13T08:00:00+08:00");
const TASKS = [
  { type: "单词", title: "复习 30 个旧词 + 学习 20 个新词", minutes: 12, icon: "词" },
  { type: "阅读", title: "仔细阅读 1 篇，完成后自批", minutes: 10, icon: "读" },
  { type: "翻译", title: "段落翻译 1 题，对照参考译文", minutes: 8, icon: "译" },
];

function formatRemainingDays(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function HomePage() {
  const [daysLeft, setDaysLeft] = useState(0);
  const [activeTask, setActiveTask] = useState<number | null>(null);

  useEffect(() => {
    setDaysLeft(formatRemainingDays(EXAM_DATE));
  }, []);

  const totalMinutes = TASKS.reduce((sum, task) => sum + task.minutes, 0);
  const examProgress = 31;

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
        <div className="rounded-full border border-[#e4e7ed] bg-white px-4 py-2 text-sm font-medium text-[#737a88]">
          今日
        </div>
      </header>

      <section className="mt-9 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[28px] border border-[#e4e7ed] bg-white p-7 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
          <div className="text-sm font-medium tracking-wide text-[#4f6df5]">
            今日简报
          </div>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            距离四级考试还有 {daysLeft} 天。
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#737a88]">
            今天已经替你排好 3 项任务，预计 {totalMinutes} 分钟。打开第一项，别给自己纠结的机会。
          </p>
          <button
            type="button"
            className="mt-7 rounded-2xl bg-[#4f6df5] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5"
            onClick={() => setActiveTask(0)}
          >
            开始今日任务
          </button>
        </article>

        <article className="rounded-[28px] border border-[#e4e7ed] bg-white p-7 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-[#737a88]">备考进度</div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">
                {examProgress}%
              </div>
            </div>
            <div className="rounded-2xl bg-[#e9edff] px-3 py-2 text-sm font-semibold text-[#4f6df5]">
              连续 12 天
            </div>
          </div>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#eef0f4]">
            <div
              className="h-full rounded-full bg-[#4f6df5] transition-all"
              style={{ width: `${examProgress}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["1268", "已掌握词汇"],
              ["68%", "平均正确率"],
              ["47", "剩余天数"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-[#f7f8fa] p-3">
                <div className="text-lg font-semibold">{value}</div>
                <div className="mt-1 text-xs text-[#737a88]">{label}</div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">今日任务</h2>
          <span className="text-sm text-[#737a88]">
            {activeTask !== null ? `${activeTask + 1}/${TASKS.length}` : "0/3"} 完成
          </span>
        </div>
        <div className="grid gap-3">
          {TASKS.map((task, index) => (
            <button
              key={task.title}
              type="button"
              onClick={() => setActiveTask(index)}
              className={`flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition ${
                activeTask === index
                  ? "border-[#4f6df5] shadow-[0_10px_30px_rgba(79,109,245,0.10)]"
                  : "border-[#e4e7ed]"
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9edff] text-sm font-semibold text-[#4f6df5]">
                {task.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{task.title}</span>
                <span className="mt-1 block text-xs text-[#737a88]">
                  {task.type} · 约 {task.minutes} 分钟
                </span>
              </span>
              <span className="rounded-xl bg-[#f7f8fa] px-3 py-2 text-xs font-medium text-[#737a88]">
                {activeTask === index ? "进行中" : "待完成"}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
