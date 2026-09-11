import type { GameResult } from "../types/result";
import { isQuestion } from "./questionSelector";

export const STORAGE_KEYS = {
  player: "doghouse_player",
  results: "doghouse_results",
  settings: "doghouse_settings",
} as const;
function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function readPlayer(): string {
  const value = read(STORAGE_KEYS.player);
  return typeof value === "string" ? value.slice(0, 24) : "";
}
export const savePlayer = (nickname: string) =>
  write(STORAGE_KEYS.player, nickname);
const finite = (n: unknown) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;
export function isResult(value: unknown): value is GameResult {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  if (
    !["id", "nickname", "finishQuote", "wrongQuote"].every(
      (k) => typeof r[k] === "string",
    )
  )
    return false;
  if (
    ![
      "timestamp",
      "score",
      "correct",
      "total",
      "accuracy",
      "maxCombo",
      "averageTime",
    ].every((k) => finite(r[k]))
  )
    return false;
  if (
    !r.categoryStats ||
    typeof r.categoryStats !== "object" ||
    Array.isArray(r.categoryStats)
  )
    return false;
  if (
    !Object.values(r.categoryStats).every(
      (s) => s && typeof s === "object" && finite(s.correct) && finite(s.total),
    )
  )
    return false;
  return (
    Array.isArray(r.answers) &&
    r.answers.every(
      (a) =>
        a &&
        typeof a === "object" &&
        isQuestion(a.question) &&
        typeof a.correct === "boolean" &&
        typeof a.timedOut === "boolean" &&
        [
          "elapsed",
          "base",
          "timeBonus",
          "comboBonus",
          "multiplier",
          "earned",
          "combo",
        ].every((k) => finite(a[k])) &&
        (a.selected === null ||
          typeof a.selected === "boolean" ||
          Number.isInteger(a.selected) ||
          (Array.isArray(a.selected) && a.selected.every(Number.isInteger))),
    )
  );
}
export function readResults(): GameResult[] {
  const value = read(STORAGE_KEYS.results);
  return Array.isArray(value)
    ? value
        .filter(isResult)
        .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
    : [];
}
export function saveResult(result: GameResult): boolean {
  return write(STORAGE_KEYS.results, [
    result,
    ...readResults().filter((r) => r.id !== result.id),
  ]);
}
export function clearResults(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.results);
    return true;
  } catch {
    return false;
  }
}
