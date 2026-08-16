import { Suspense } from "react";
import { FavoritesClient } from "./favorites-client";

export default function FavoritesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
          正在加载收藏夹...
        </main>
      }
    >
      <FavoritesClient />
    </Suspense>
  );
}
