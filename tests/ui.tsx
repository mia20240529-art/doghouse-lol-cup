import { useState } from "react";
import { createRoot } from "react-dom/client";
import Quiz from "../src/pages/Quiz";
import Result from "../src/pages/Result";
import History from "../src/pages/History";
import type { Question } from "../src/types/question";
import type { GameResult } from "../src/types/result";
import "../src/styles.css";
const base = {
  enabled: true,
  verified: true,
  category: "mechanics",
  difficulty: "hard" as const,
  patch: "TEST",
  explanation: "软件夹具：只验证界面与计分，不包含 LOL 事实。",
  source: "本地测试夹具",
  timeLimit: 30,
};
const questions: Question[] = [
  {
    ...base,
    id: "ui-single",
    type: "single",
    question: "【软件测试】选择测试值 A。",
    options: ["测试值 A", "测试值 B", "测试值 C", "测试值 D"],
    answer: 0,
  },
  {
    ...base,
    id: "ui-multiple",
    type: "multiple",
    question: "【软件测试】选择测试值 A 和 C。",
    options: ["测试值 A", "测试值 B", "测试值 C", "测试值 D"],
    answer: [0, 2],
  },
  {
    ...base,
    id: "ui-boolean",
    type: "boolean",
    question: "【软件测试】判断控件：选择正确。",
    answer: true,
  },
  {
    ...base,
    id: "ui-scenario",
    type: "scenario",
    question: "【软件测试】情景控件：选择测试值 B。",
    options: ["测试值 A", "测试值 B", "测试值 C", "测试值 D"],
    answer: 1,
  },
  {
    ...base,
    id: "ui-timeout",
    type: "single",
    difficulty: "doghouse",
    question: "【软件测试】等待超时，不点击答案。",
    options: ["测试值 A", "测试值 B", "测试值 C", "测试值 D"],
    answer: 0,
    timeLimit: 1,
  },
];
function Harness() {
  const [result, setResult] = useState<GameResult | null>(null);
  const [history, setHistory] = useState(false);
  return (
    <div className="app-shell">
      <header className="site-header">仅本地软件测试 · 不进入正式题库</header>
      {history ? (
        <History
          onStart={() => {
            setHistory(false);
            setResult(null);
          }}
          onOpen={setResult}
        />
      ) : result ? (
        <Result
          result={result}
          saved={false}
          onRetry={() => setResult(null)}
          onHistory={() => setHistory(true)}
        />
      ) : (
        <Quiz
          questions={questions}
          nickname="软件测试选手"
          onFinish={setResult}
        />
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Harness />);
