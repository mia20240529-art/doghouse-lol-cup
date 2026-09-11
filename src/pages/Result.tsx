import type { GameResult } from "../types/result";
import ResultCard from "../components/ResultCard";
import CategoryStats from "../components/CategoryStats";
import QuoteBox from "../components/QuoteBox";
import { answerText, worstMistake } from "../utils/scoring";
export default function Result({
  result,
  saved,
  onRetry,
  onHistory,
}: {
  result: GameResult;
  saved: boolean;
  onRetry: () => void;
  onHistory: () => void;
}) {
  const worst = worstMistake(result.answers);
  return (
    <main className="content-page result-page enter">
      <ResultCard result={result} />
      <QuoteBox quote={result.finishQuote} />
      {!saved && (
        <p className="notice" role="alert">
          浏览器未能保存成绩（存储不可用或空间不足）。本页成绩仍可查看，请保留截图。
        </p>
      )}
      <CategoryStats stats={result.categoryStats} />
      {worst ? (
        <section className="card worst-mistake">
          <p className="kicker">THE UNFORGETTABLE MISS</p>
          <h2>本届最离谱错误</h2>
          <p className="mistake-question">{worst.question.question}</p>
          <div className="mistake-answers">
            <p>
              <span>你的答案</span>
              {answerText(worst.question, worst.selected)}
            </p>
            <p>
              <span>正确答案</span>
              {answerText(worst.question, worst.question.answer)}
            </p>
          </div>
          <QuoteBox quote={result.wrongQuote} />
          <small className="muted">从本局错题中按难度最高选取。</small>
        </section>
      ) : (
        <section className="card">
          <h2>本届没有离谱错误。</h2>
          <p className="muted">全部答对，狗窝委员会已收到你的成绩。</p>
        </section>
      )}
      <div className="result-actions">
        <button className="primary" onClick={onRetry}>
          再考一次
        </button>
        <button className="secondary" onClick={onHistory}>
          历史成绩
        </button>
      </div>
      <p className="local-note">
        成绩仅保存在当前浏览器 · 清除浏览器数据后无法恢复
      </p>
    </main>
  );
}
