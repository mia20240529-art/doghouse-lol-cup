import { useEffect, useRef, useState } from "react";
import type { Question } from "../types/question";
import type { AnswerRecord, GameResult } from "../types/result";
import { buildResult } from "../utils/scoring";
import QuestionCard from "../components/QuestionCard";
import ScoreBar from "../components/ScoreBar";
export default function Quiz({
  questions,
  nickname,
  onFinish,
}: {
  questions: Question[];
  nickname: string;
  onFinish: (result: GameResult) => void;
}) {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [index, setIndex] = useState(0);
  const id = useRef(crypto.randomUUID());
  const finished = useRef(false);
  const answersRef = useRef<AnswerRecord[]>([]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!finished.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  if (!questions.length)
    return (
      <main className="narrow-page">
        <p className="notice">狗窝委员会还没有审核题目。</p>
      </main>
    );
  const combo = answers.at(-1)?.combo ?? 0;
  return (
    <main className="quiz-page">
      <ScoreBar
        index={index}
        total={questions.length}
        combo={combo}
        score={answers.reduce((sum, a) => sum + a.earned, 0)}
      />
      <div className="quiz-progress">
        <span style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <QuestionCard
        key={questions[index].id}
        question={questions[index]}
        combo={answers[index - 1]?.combo ?? 0}
        last={index === questions.length - 1}
        onAnswer={(record) => {
          if (
            answersRef.current.some((a) => a.question.id === record.question.id)
          )
            return;
          answersRef.current = [...answersRef.current, record];
          setAnswers(answersRef.current);
        }}
        onNext={() => {
          if (finished.current || answersRef.current.length !== index + 1)
            return;
          if (index === questions.length - 1) {
            finished.current = true;
            onFinish(buildResult(nickname, answersRef.current, id.current));
          } else {
            setIndex(index + 1);
            window.scrollTo({ top: 0 });
          }
        }}
      />
      <p className="local-note">
        参赛选手：{nickname} · 禁止搜索 · 提交后不可修改
      </p>
    </main>
  );
}
