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
  onFinish: (
    correctCount: number,
    totalCount: number,
    wrongAnswers: { questionId: string; chosenIndex: number }[],
  ) => void;
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
    const wrong = passage.questions
      .filter((q) => answers[q.id] !== q.correct_index)
      .map((q) => ({
        questionId: q.id,
        chosenIndex: answers[q.id],
      }));
    onFinish(correct, total, wrong);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← 返回
        </button>
        <span className="text-sm text-[var(--muted)]">
          已答 {answeredCount} / {total}
        </span>
      </div>

      <article className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_16px_50px_rgba(30,35,55,0.06)]">
        <h1 className="text-xl font-semibold tracking-tight">{passage.title}</h1>
        <div className="mt-5 whitespace-pre-wrap text-[15px] leading-8 text-[var(--foreground)]">
          {passage.content}
        </div>
      </article>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">阅读理解</h2>
        <div className="mt-4 grid gap-4">
          {passage.questions.map((question, qi) => (
            <div
              key={question.id}
              className="rounded-[20px] border border-[var(--line)] bg-[var(--card)] p-5"
            >
              <div className="text-sm font-semibold text-[var(--foreground)]">
                {qi + 1}. {question.question}
              </div>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, oi) => {
                  const selected = answers[question.id] === oi;
                  const isCorrect = oi === question.correct_index;
                  let optionStyle = "border-[var(--line)] bg-[var(--card)]";
                  if (submitted && isCorrect) {
                    optionStyle = "border-[var(--success)] bg-[var(--success-soft)]";
                  } else if (submitted && selected && !isCorrect) {
                    optionStyle = "border-[var(--danger)] bg-[var(--danger-soft)]";
                  } else if (selected) {
                    optionStyle = "border-[var(--brand)] bg-[var(--brand-soft)]";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectAnswer(question.id, oi)}
                      disabled={submitted}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${optionStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-strong)] text-xs font-semibold text-[var(--muted)]">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
              {submitted ? (
                <div className="mt-3 rounded-xl bg-[var(--surface)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
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
          className="mt-8 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,109,245,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {answeredCount < total ? `还需回答 ${total - answeredCount} 题` : "提交答案"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onExit}
          className="mt-8 w-full rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
        >
          返回今日任务
        </button>
      )}
    </main>
  );
}
