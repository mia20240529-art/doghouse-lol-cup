export type Difficulty = "hard" | "hell" | "insane" | "doghouse";
export type Answer = number | number[] | boolean;
interface QuestionBase {
  id: string;
  enabled: boolean;
  verified: boolean;
  category: string;
  difficulty: Difficulty;
  patch: string;
  question: string;
  score?: number;
  timeLimit?: number;
  explanation: string;
  source: string;
}
export interface ChoiceQuestion extends QuestionBase {
  type: "single" | "scenario";
  options: string[];
  answer: number;
}
export interface MultipleQuestion extends QuestionBase {
  type: "multiple";
  options: string[];
  answer: number[];
}
export interface BooleanQuestion extends QuestionBase {
  type: "boolean";
  options?: string[];
  answer: boolean;
}
export type Question = ChoiceQuestion | MultipleQuestion | BooleanQuestion;
