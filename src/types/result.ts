import type { Answer, Question } from "./question";
export interface CategoryStat {
  correct: number;
  total: number;
}
export interface AnswerRecord {
  question: Question;
  selected: Answer | null;
  correct: boolean;
  timedOut: boolean;
  elapsed: number;
  base: number;
  timeBonus: number;
  comboBonus: number;
  multiplier: number;
  earned: number;
  combo: number;
}
export interface GameResult {
  id: string;
  nickname: string;
  timestamp: number;
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  maxCombo: number;
  averageTime: number;
  categoryStats: Record<string, CategoryStat>;
  answers: AnswerRecord[];
  finishQuote: string;
  wrongQuote: string;
}
