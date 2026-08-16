import { Suspense } from "react";
import { TranslationClient } from "./translation-client";

export default function TranslationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
          正在加载翻译材料...
        </main>
      }
    >
      <TranslationClient />
    </Suspense>
  );
}
