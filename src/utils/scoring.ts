import config from "../data/config.json";
import titles from "../data/titles.json";
import quotes from "../data/quotes.json";
import type { Answer, Question } from "../types/question";
import type { AnswerRecord, GameResult } from "../types/result";

export const categoryLabel = (key: string) =>
  (config.categoryLabels as Record<string, string>)[key] ?? key;
export const timeLimitFor = (q: Question) =>
  q.timeLimit ?? config.difficulties[q.difficulty].timeLimit;
export const baseScoreFor = (q: Question) =>
  q.score ?? config.difficulties[q.difficulty].score;
export const pickQuote = (kind: keyof typeof quotes) =>
  quotes[kind][Math.floor(Math.random() * quotes[kind].length)] ?? "";
export const titleFor = (accuracy: number) =>
  titles.find((t) => accuracy <= t.maxAccuracy)?.title ??
  titles[titles.length - 1].title;

export function isCorrect(q: Question, selected: Answer | null): boolean {
  if (q.type === "multiple")
    return (
      Array.isArray(selected) &&
      selected.length === q.answer.length &&
      new Set(selected).size === selected.length &&
      q.answer.every((a) => selected.includes(a))
    );
  return q.answer === selected;
}

export function answerText(q: Question, answer: Answer | null): string {
  if (answer === null) return "未作答（超时）";
  if (typeof answer === "boolean") return answer ? "正确" : "错误";
  const option = (i: number) =>
    `${String.fromCharCode(65 + i)}. ${q.options?.[i] ?? "未知选项"}`;
  return Array.isArray(answer) ? answer.map(option).join("；") : option(answer);
}

export function scoreAnswer(
  q: Question,
  selected: Answer | null,
  elapsedSeconds: number,
  previousCombo: number,
): AnswerRecord {
  const limit = timeLimitFor(q);
  const elapsed = Math.max(0, Math.min(limit, elapsedSeconds));
  const timedOut = elapsed >= limit;
  const correct = !timedOut && isCorrect(q, selected);
  const combo = correct ? previousCombo + 1 : 0;
  const base = correct ? baseScoreFor(q) : 0;
  const timeBonus = correct
    ? Math.round((1 - elapsed / limit) * base * 0.15)
    : 0;
  const comboBonus = combo === 3 ? 50 : combo === 5 ? 100 : 0;
  // 第 8 题激活暴走，第 9 题起享受倍率；里程碑奖励每段连胜只发一次。
  const multiplier = correct && previousCombo >= 8 ? 1.2 : 1;
  return {
    question: q,
    selected: timedOut ? null : selected,
    correct,
    timedOut,
    elapsed,
    base,
    timeBonus,
    comboBonus,
    multiplier,
    earned: Math.round((base + timeBonus) * multiplier) + comboBonus,
    combo,
  };
}

export function buildResult(
  nickname: string,
  answers: AnswerRecord[],
  id: string,
): GameResult {
  const categoryStats: GameResult["categoryStats"] = Object.create(
    null,
  ) as GameResult["categoryStats"];
  for (const a of answers) {
    const stat = categoryStats[a.question.category] ?? { correct: 0, total: 0 };
    stat.total++;
    if (a.correct) stat.correct++;
    categoryStats[a.question.category] = stat;
  }
  const correct = answers.filter((a) => a.correct).length;
  return {
    id,
    nickname,
    timestamp: Date.now(),
    score: answers.reduce((sum, a) => sum + a.earned, 0),
    correct,
    total: answers.length,
    accuracy: answers.length ? (correct / answers.length) * 100 : 0,
    maxCombo: Math.max(0, ...answers.map((a) => a.combo)),
    averageTime: answers.length
      ? answers.reduce((sum, a) => sum + a.elapsed, 0) / answers.length
      : 0,
    categoryStats,
    answers,
    finishQuote: pickQuote("finish"),
    wrongQuote: pickQuote("wrong"),
  };
}

export function worstMistake(answers: AnswerRecord[]) {
  return answers
    .filter((a) => !a.correct)
    .sort(
      (a, b) =>
        config.difficulties[b.question.difficulty].rank -
        config.difficulties[a.question.difficulty].rank,
    )[0];
}
