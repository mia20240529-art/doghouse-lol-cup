import { Award } from "lucide-react";
import type { GameResult } from "../types/result";
import { titleFor } from "../utils/scoring";
export default function ResultCard({ result }: { result: GameResult }) {
  return (
    <section className="result-hero">
      <div className="result-heading">
        <div>
          <p className="kicker">DOGHOUSE CUP / FINAL RESULT</p>
          <h1>{result.nickname}</h1>
          <span className="result-date">
            {new Date(result.timestamp).toLocaleString("zh-CN")}
          </span>
        </div>
        <Award size={58} strokeWidth={1} />
      </div>
      <div className="result-title">
        <span>本届认证称号</span>
        <h2>{titleFor(result.accuracy)}</h2>
      </div>
      <div className="final-score">
        <strong>{result.score.toLocaleString()}</strong>
        <span>最终总分</span>
      </div>
      <div className="result-metrics">
        <div>
          <strong>
            {result.correct}
            <small> / {result.total}</small>
          </strong>
          <span>答对 / 总题数</span>
        </div>
        <div>
          <strong>
            {Number(result.accuracy.toFixed(1))}
            <small>%</small>
          </strong>
          <span>正确率</span>
        </div>
        <div>
          <strong>
            {result.maxCombo}
            <small> 连</small>
          </strong>
          <span>最长 Combo</span>
        </div>
        <div>
          <strong>
            {result.averageTime.toFixed(1)}
            <small> 秒</small>
          </strong>
          <span>平均答题时间</span>
        </div>
      </div>
    </section>
  );
}
