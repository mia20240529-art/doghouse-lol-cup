import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import config from "../data/config.json";
import type { Answer, Question } from "../types/question";
import type { AnswerRecord } from "../types/result";
import {
  answerText,
  categoryLabel,
  pickQuote,
  scoreAnswer,
  timeLimitFor,
} from "../utils/scoring";
import AnswerOption from "./AnswerOption";
import Timer from "./Timer";
import QuoteBox from "./QuoteBox";
export default function QuestionCard({
  question,
  combo,
  last,
  onAnswer,
  onNext,
}: {
  question: Question;
  combo: number;
  last: boolean;
  onAnswer: (record: AnswerRecord) => void;
  onNext: () => void;
}) {
  const limit = timeLimitFor(question);
  const [remaining, setRemaining] = useState(limit);
  const [selected, setSelected] = useState<number[]>([]);
  const [record, setRecord] = useState<AnswerRecord | null>(null);
  const [quote, setQuote] = useState("");
  const deadline = useRef<number | null>(null);
  const locked = useRef(false);
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;
  const submit = useCallback(
    (answer: Answer | null) => {
      if (locked.current || deadline.current === null) return;
      locked.current = true;
      const left = Math.max(
        0,
        Math.min(limit, (deadline.current - Date.now()) / 1000),
      );
      const result = scoreAnswer(question, answer, limit - left, combo);
      setRemaining(left);
      setRecord(result);
      setQuote(pickQuote(result.correct ? "correct" : "wrong"));
      onAnswerRef.current(result);
    },
    [question, combo, limit],
  );
  useEffect(() => {
    if (record) return;
    deadline.current ??= Date.now() + limit * 1000;
    const tick = () => {
      if (locked.current) return;
      const left = Math.max(0, ((deadline.current ?? 0) - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) submit(null);
    };
    const timer = window.setInterval(tick, 80);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [limit, record, submit]);
  const multiple = question.type === "multiple";
  const options =
    question.type === "boolean" ? ["正确", "错误"] : question.options;
  const choose = (index: number) => {
    if (locked.current) return;
    if (multiple)
      setSelected((current) =>
        current.includes(index)
          ? current.filter((i) => i !== index)
          : [...current, index],
      );
    else submit(question.type === "boolean" ? index === 0 : index);
  };
  const selectedIndex = (index: number) =>
    record
      ? record.selected !== null &&
        (question.type === "boolean"
          ? record.selected === (index === 0)
          : Array.isArray(record.selected)
            ? record.selected.includes(index)
            : record.selected === index)
      : selected.includes(index);
  const correctIndex = (index: number) =>
    question.type === "boolean"
      ? question.answer === (index === 0)
      : Array.isArray(question.answer)
        ? question.answer.includes(index)
        : question.answer === index;
  return (
    <section className="question-card enter">
      <Timer remaining={remaining} limit={limit} stopped={!!record} />
      <div className="question-meta">
        <span className="category-tag">{categoryLabel(question.category)}</span>
        <span className={`difficulty ${question.difficulty}`}>
          {config.difficulties[question.difficulty].label}
        </span>
        <span className="muted">
          {multiple
            ? "多选题 · 全选正确才得分"
            : question.type === "boolean"
              ? "判断题"
              : question.type === "scenario"
                ? "情景机制题 · 单选"
                : "单选题"}
        </span>
      </div>
      {question.patch && <p className="patch">规则版本：{question.patch}</p>}
      <h1 className="question-text">{question.question}</h1>
      <div className="answer-list">
        {options.map((option, index) => (
          <AnswerOption
            key={index}
            label={option}
            index={index}
            multiple={multiple}
            selected={selectedIndex(index)}
            locked={!!record}
            correct={!!record && correctIndex(index)}
            onSelect={() => choose(index)}
          />
        ))}
      </div>
      {multiple && !record && (
        <button
          className="primary confirm-answer"
          disabled={!selected.length}
          onClick={() => submit(selected)}
        >
          确认答案
          <CheckCircle2 size={18} />
        </button>
      )}
      {record && (
        <div
          className={`feedback ${record.correct ? "feedback-correct" : "feedback-wrong"}`}
        >
          <div className="feedback-heading" role="status">
            {record.timedOut ? (
              <Clock3 />
            ) : record.correct ? (
              <CheckCircle2 />
            ) : (
              <XCircle />
            )}
            <h2>
              {record.timedOut
                ? "时间到 · 回答错误"
                : record.correct
                  ? "回答正确"
                  : "回答错误"}
            </h2>
            <strong>+{record.earned} 分</strong>
          </div>
          {record.correct ? (
            <p className="score-detail">
              基础 {record.base} + 时间 {record.timeBonus}
              {record.multiplier > 1 ? "，暴走 ×1.2" : ""}
              {record.comboBonus > 0 ? ` + 连胜 ${record.comboBonus}` : ""}
            </p>
          ) : (
            <p>正确答案：{answerText(question, question.answer)}</p>
          )}
          {record.combo === 8 && (
            <div className="rampage-alert" role="status">
              狗窝暴走 · 后续连续答对积分 ×1.2
            </div>
          )}
          <QuoteBox quote={quote} />
          <details>
            <summary>查看解析</summary>
            <div className="explanation">
              <p>
                <b>正确答案：</b>
                {answerText(question, question.answer)}
              </p>
              <p>
                <b>详细解析：</b>
                {question.explanation || "暂无解析"}
              </p>
              <p>
                <b>版本：</b>
                {question.patch || "未指定版本"}
              </p>
              <p>
                <b>信息来源：</b>
                {/^https?:\/\//i.test(question.source) ? (
                  <a href={question.source} target="_blank" rel="noreferrer">
                    {question.source}
                  </a>
                ) : (
                  question.source || "未提供"
                )}
              </p>
            </div>
          </details>
          <button className="primary next-button" onClick={onNext}>
            {last ? "查看最终成绩" : "下一题"}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
