import { Suspense } from "react";
import { CalendarClient } from "./calendar-client";

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
          正在加载日历...
        </main>
      }
    >
      <CalendarClient />
    </Suspense>
  );
}
