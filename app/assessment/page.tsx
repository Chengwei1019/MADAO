import { Suspense } from "react";
import { AssessmentClient } from "./assessment-client";

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
          正在准备测评...
        </main>
      }
    >
      <AssessmentClient />
    </Suspense>
  );
}
