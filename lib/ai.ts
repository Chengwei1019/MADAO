import OpenAI from "openai";

const baseURL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export const aiClient = apiKey
  ? new OpenAI({ apiKey, baseURL })
  : null;

export async function generateDailyPlan(input: {
  examDate: string;
  level: string;
  minutesAvailable: number;
}) {
  if (!aiClient) {
    throw new Error("DeepSeek API Key 未配置。");
  }

  const response = await aiClient.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "你是 Metis 的督学编排器。只输出合法 JSON，不生成题目或知识内容。",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
