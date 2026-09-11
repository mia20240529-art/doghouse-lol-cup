import { useState } from "react";
import { History as HistoryIcon, Trash2, ArrowUpRight } from "lucide-react";
import { clearResults, readResults } from "../utils/storage";
import { titleFor } from "../utils/scoring";
import type { GameResult } from "../types/result";
export default function History({
  onOpen,
  onStart,
}: {
  onOpen: (result: GameResult) => void;
  onStart: () => void;
}) {
  const [results, setResults] = useState(readResults);
  const [error, setError] = useState("");
  return (
    <main className="content-page enter">
      <p className="kicker">YOUR HALL OF FAME</p>
      <div className="page-heading">
        <div>
          <h1 className="page-title">战绩会说话。</h1>
          <p className="page-intro">
            当前浏览器的个人成绩，按分数从高到低排列。
          </p>
        </div>
        {results.length > 0 && (
          <button
            className="text-button"
            onClick={() => {
              if (
                window.confirm(
                  "确定清空此浏览器的所有历史成绩吗？此操作不可恢复，昵称会保留。",
                )
              ) {
                if (clearResults()) setResults([]);
                else setError("清空失败：浏览器存储不可用，请稍后重试。");
              }
            }}
          >
            <Trash2 size={17} />
            清空历史成绩
          </button>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {results.length ? (
        <div className="history-list">
          {results.map((result, index) => (
            <button
              className="history-row"
              key={result.id}
              onClick={() => onOpen(result)}
            >
              <span className={`rank ${index < 3 ? "gold" : ""}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="history-player">
                <strong>{result.nickname}</strong>
                <span>{titleFor(result.accuracy)}</span>
                <small>
                  {new Date(result.timestamp).toLocaleString("zh-CN")}
                </small>
              </div>
              <div className="history-accuracy">
                <strong>
                  {result.correct} / {result.total}
                </strong>
                <small>正确率 {Number(result.accuracy.toFixed(1))}%</small>
              </div>
              <div className="history-score">
                <strong>{result.score.toLocaleString()}</strong>
                <small>总分</small>
              </div>
              <ArrowUpRight size={20} />
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <HistoryIcon size={42} strokeWidth={1} />
          <h2>还没有你的战绩。</h2>
          <p>第一份成绩，等你来写。</p>
          <button className="primary" onClick={onStart}>
            开始考试
          </button>
        </div>
      )}
      <p className="local-note">历史记录不跨设备同步，也不是全服排行榜。</p>
    </main>
  );
}
