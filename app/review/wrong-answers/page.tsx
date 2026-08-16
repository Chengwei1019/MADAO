import { Suspense } from "react";
import { WrongAnswersClient } from "./wrong-answers-client";

export default function WrongAnswersPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
          正在加载错题本...
        </main>
      }
    >
      <WrongAnswersClient />
    </Suspense>
  );
}
