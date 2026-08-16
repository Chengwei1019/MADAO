import { NextResponse } from "next/server";
import { generateDailyPlan } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const level = body.level === "cet6" ? "cet6" : "cet4";
    const examDate = String(body.examDate ?? "");
    const minutesAvailable = Math.min(
      120,
      Math.max(10, Number(body.minutesAvailable ?? 30)),
    );

    if (!examDate) {
      return NextResponse.json(
        { error: "Missing exam date." },
        { status: 400 },
      );
    }

    const plan = await generateDailyPlan({
      examDate,
      level,
      minutesAvailable,
      completedTaskTypes: Array.isArray(body.completedTaskTypes)
        ? body.completedTaskTypes.map(String)
        : undefined,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate daily plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
