import config from "../data/config.json";
import type { Question } from "../types/question";

const excludedFromCompetition = new Set([
  // 基础英雄/技能常识，保留在150题母库，但正式随机局不再抽取
  "mech_061",
  "mech_062",
  "mech_063",
  "mech_064",
  "mech_065",
  "mech_070",
  "mech_072",
  "mech_080",
  "mech_085",
  "mech_088",
  "mech_089",
  "mech_090",
  "mech_091",
  // 过于直接的阵容/位置记忆题
  "esports_043",
  "esports_044",
  "esports_045",
  "esports_046",
  "esports_048",
  "esports_050",
  "esports_051",
  "esports_053",
  "esports_054"
]);

export function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;
  const q = value as Record<string, unknown>;
  if (
    !["id", "category", "question", "explanation", "source", "patch"].every(
      (k) => typeof q[k] === "string",
    )
  )
    return false;
  if (
    !q.id ||
    !q.question ||
    !["hard", "hell", "insane", "doghouse"].includes(String(q.difficulty))
  )
    return false;
  if (typeof q.enabled !== "boolean" || typeof q.verified !== "boolean")
    return false;
  for (const k of ["score", "timeLimit"])
    if (
      q[k] !== undefined &&
      (typeof q[k] !== "number" || !Number.isFinite(q[k]) || Number(q[k]) <= 0)
    )
      return false;
  if (q.type === "boolean") return typeof q.answer === "boolean";
  if (
    !Array.isArray(q.options) ||
    q.options.length < 2 ||
    !q.options.every((o) => typeof o === "string" && o.trim())
  )
    return false;
  const length = q.options.length;
  const validIndex = (a: unknown) =>
    typeof a === "number" && Number.isInteger(a) && a >= 0 && a < length;
  if (q.type === "multiple")
    return (
      Array.isArray(q.answer) &&
      q.answer.length > 0 &&
      q.answer.every(validIndex) &&
      new Set(q.answer).size === q.answer.length
    );
  return (q.type === "single" || q.type === "scenario") && validIndex(q.answer);
}

export function getValidQuestions(data: unknown): Question[] {
  const source = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { questions?: unknown }).questions)
      ? (data as { questions: unknown[] }).questions
      : [];
  const seen = new Set<string>();
  return source.filter((value): value is Question => {
    if (
      !isQuestion(value) ||
      !value.enabled ||
      !value.verified ||
      seen.has(value.id)
    )
      return false;
    seen.add(value.id);
    return true;
  });
}

function getCompetitionQuestions(data: unknown): Question[] {
  return getValidQuestions(data).filter(
    (q) =>
      q.difficulty !== "hard" &&
      q.category !== "doghouse" &&
      !excludedFromCompetition.has(q.id),
  );
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

export function selectQuestions(
  data: unknown,
  count = config.questionCount,
  random = Math.random,
): Question[] {
  // 正式狗窝杯只从“地狱/逆天”高难池抽题；150题母库仍完整保留，方便后续审核与替换。
  const pool = shuffle(getCompetitionQuestions(data), random);
  const size = Math.min(Math.max(0, Math.floor(count)), pool.length);
  if (size === 0) return [];
  const groups = shuffle(config.categoryGroups, random);
  const totalWeight = groups.reduce((sum, g) => sum + g.weight, 0);
  const quotas = groups.map((group) => ({
    ...group,
    quota: Math.floor((size * group.weight) / totalWeight),
    remainder: ((size * group.weight) / totalWeight) % 1,
  }));
  let spare = size - quotas.reduce((sum, g) => sum + g.quota, 0);
  for (const group of [...quotas].sort((a, b) => b.remainder - a.remainder))
    if (spare-- > 0) group.quota++;
  const selected = quotas.flatMap((group) =>
    pool
      .filter((q) => group.categories.includes(q.category))
      .slice(0, group.quota),
  );
  const ids = new Set(selected.map((q) => q.id));
  selected.push(
    ...pool.filter((q) => !ids.has(q.id)).slice(0, size - selected.length),
  );
  return shuffle(selected, random);
}
