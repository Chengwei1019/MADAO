"use client";

type MonthCalendarProps = {
  year: number;
  month: number;
  checkedDates: Set<string>;
  onPrev: () => void;
  onNext: () => void;
};

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function MonthCalendar({
  year,
  month,
  checkedDates,
  onPrev,
  onNext,
}: MonthCalendarProps) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingEmpty = firstDay.getDay();
  const cells: React.ReactNode[] = [];

  for (let i = 0; i < leadingEmpty; i += 1) {
    cells.push(<span key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day);
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const checked = checkedDates.has(key);
    const isToday = key === localToday();
    cells.push(
      <div
        key={key}
        className={`flex h-12 items-center justify-center rounded-xl text-sm ${
          checked
            ? "bg-[var(--brand)] font-semibold text-white"
            : "text-[var(--foreground)]"
        } ${isToday ? "ring-2 ring-[var(--brand)] ring-offset-1" : ""}`}
      >
        {day}
      </div>,
    );
  }

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-lg px-3 py-1 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)]"
        >
          ← 上月
        </button>
        <div className="text-base font-semibold">
          {year} 年 {month} 月
        </div>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg px-3 py-1 text-sm text-[var(--muted)] transition hover:bg-[var(--surface)]"
        >
          下月 →
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[var(--muted)]">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">{cells}</div>
      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-[var(--brand)]" /> 已打卡
        </span>
        <span>蓝色格子代表当天完成了学习任务</span>
      </div>
    </div>
  );
}

function localToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
