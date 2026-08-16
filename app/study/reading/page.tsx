import { Suspense } from "react";
import { ReadingClient } from "./reading-client";

export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[#737a88]">
          正在加载阅读材料...
        </main>
      }
    >
      <ReadingClient />
    </Suspense>
  );
}
