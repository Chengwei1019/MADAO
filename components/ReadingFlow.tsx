"use client";

import { useState } from "react";

export type ReadingQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  content: string;
  questions: ReadingQuestion[];
};

type ReadingFlowProps = {
  passage: ReadingPassage;
  onFinish: (correctCount: number, totalCount: number) => void;
  onExit: () => void;
};

export function ReadingFlow({
  passage,
  onFinish,
  onExit,
}: ReadingFlowProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = passage.questions.length;
  const answeredCount = Object.keys(answers).length;

  function selectAnswer(questionId: string, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function submit() {
    if (answeredCount < total) return;
    setSubmitted(true);
    const correct = passage.questions.filter(
      (q) => answers[q.id] === q.correct_index,
    ).length;
    onFinish(correct, total);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-medium text-[#737a88] transition hover:text-[#3a3f4b]"
        >
          ← 返回
        </button>
        <span className="text-sm text-[#737a88]">
          已答 {answeredCount} / {total}
        </span>
      </div>

      <article className="rounded-[24px] border border-[#e4e7ed] bg-white p-8 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
        <h1 className="text-xl font-semibold tracking-tight">{passage.title}</h1>
        <div className="mt-5 whitespace-pre-wrap text-[15px] leading-8 text-[#3a3f4b]">
          {passage.content}
        </div>
      </article>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">阅读理解</h2>
        <div className="mt-4 grid gap-4">
          {passage.questions.map((question, qi) => (
            <div
              key={question.id}
              className="rounded-[20px] border border-[#e4e7ed] bg-white p-5"
            >
              <div className="text-sm font-semibold text-[#3a3f4b]">
                {qi + 1}. {question.question}
              </div>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, oi) => {
                  const selected = answers[question.id] === oi;
                  const isCorrect = oi === question.correct_index;
                  let optionStyle = "border-[#e4e7ed] bg-white";
                  if (submitted && isCorrect) {
                    optionStyle = "border-[#22c55e] bg-[#f0fdf4]";
                  } else if (submitted && selected && !isCorrect) {
                    optionStyle = "border-[#ef4444] bg-[#fef2f2]";
                  } else if (selected) {
                    optionStyle = "border-[#4f6df5] bg-[#f4f6ff]";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectAnswer(question.id, oi)}
                      disabled={submitted}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${optionStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef0f4] text-xs font-semibold text-[#737a88]">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {submitted ? (
                <div className="mt-3 rounded-xl bg-[#f7f8fa] px-4 py-3 text-xs leading-6 text-[#737a88]">
                  {question.explanation}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {!submitted ? (
        <button
          type="button"
          disabled={answeredCount < total}
          onClick={submit}
          className="mt-8 w-full rounded-2xl bg-[#4f6df5] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {answeredCount < total ? `还需回答 ${total - answeredCount} 题` : "提交答案"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onExit}
          className="mt-8 w-full rounded-2xl bg-[#4f6df5] px-5 py-3 text-sm font-semibold text-white"
        >
          返回今日任务
        </button>
      )}
    </main>
  );
}
