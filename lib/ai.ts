import OpenAI from "openai";

const baseURL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export type PlannedTask = {
  task_type: "vocabulary" | "reading" | "translation" | "writing" | "listening";
  title: string;
  estimated_minutes: number;
};

export type DailyPlanOutput = {
  summary: string;
  total_minutes: number;
  tasks: PlannedTask[];
};

export const aiClient = apiKey
  ? new OpenAI({ apiKey, baseURL })
  : null;

export async function generateDailyPlan(input: {
  examDate: string;
  level: "cet4" | "cet6";
  minutesAvailable: number;
  completedTaskTypes?: string[];
  vocabularyScore?: number;
  assessmentLevel?: string;
}): Promise<DailyPlanOutput> {
  if (!aiClient) {
    throw new Error("DeepSeek API Key is not configured.");
  }

  const response = await aiClient.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are Metis's daily study scheduler for Chinese CET-4/CET-6 students.",
          "Only output valid JSON. Never output Markdown.",
          "Never generate actual vocabulary, questions, passages, or answers.",
          "Only choose task types from: vocabulary, reading, translation, writing, listening.",
          "Each task needs a concise Chinese title and an estimated_minutes value.",
          "Keep total_minutes close to minutesAvailable without exceeding it.",
          'Return this exact shape: {"summary":"...","total_minutes":30,"tasks":[{"task_type":"vocabulary","title":"复习 30 个旧词并学习 20 个新词","estimated_minutes":12}]}',
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "";
  const json = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  const parsed = JSON.parse(json) as DailyPlanOutput;

  if (!Array.isArray(parsed.tasks)) {
    throw new Error("AI response does not contain a tasks array.");
  }

  const allowedTypes = new Set([
    "vocabulary",
    "reading",
    "translation",
    "writing",
    "listening",
  ]);

  return {
    summary: String(parsed.summary ?? "今日计划"),
    total_minutes: Number(parsed.total_minutes ?? 0),
    tasks: parsed.tasks
      .filter((task) => allowedTypes.has(task.task_type))
      .map((task) => ({
        task_type: task.task_type,
        title: String(task.title ?? "学习任务"),
        estimated_minutes: Math.max(5, Number(task.estimated_minutes ?? 10)),
      })),
  };
}
