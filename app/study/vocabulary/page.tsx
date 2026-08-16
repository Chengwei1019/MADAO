import { Suspense } from "react";
import { VocabularyClient } from "./vocabulary-client";

export default function VocabularyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
          正在加载单词...
        </main>
      }
    >
      <VocabularyClient />
    </Suspense>
  );
}
