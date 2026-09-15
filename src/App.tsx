import { useEffect, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import rawQuestions from "./data/questions.json";
import config from "./data/config.json";
import { applyQuestionOverrides } from "./data/questionOverrides";
import { getValidQuestions, selectQuestions } from "./utils/questionSelector";
import { saveResult } from "./utils/storage";
import type { Question } from "./types/question";
import type { GameResult } from "./types/result";
import Home from "./pages/Home";
import PlayerSetup from "./pages/PlayerSetup";
import Rules from "./pages/Rules";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import History from "./pages/History";
type Page = "home" | "setup" | "rules" | "quiz" | "result" | "history";
const auditedQuestions = applyQuestionOverrides(rawQuestions);
const available = getValidQuestions(auditedQuestions);
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [nickname, setNickname] = useState("");
  const [result, setResult] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const heading = document.querySelector<HTMLElement>("main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [page]);
  const go = (next: Page) => {
    if (
      page === "quiz" &&
      !window.confirm("确定退出本局考试吗？当前进度不会保存。")
    )
      return;
    setPage(next);
  };
  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            go("home");
          }}
        >
          <Trophy />
          <span>
            狗窝杯<small>DOGHOUSE CUP</small>
          </span>
        </a>
        {page === "home" ? (
          <span className="edition">
            LOL KNOWLEDGE CHAMPIONSHIP <b> / V1.0</b>
          </span>
        ) : (
          <button className="text-button" onClick={() => go("home")}>
            <ArrowLeft size={17} />
            {page === "quiz" ? "退出考试" : "返回首页"}
          </button>
        )}
      </header>
      {page === "home" && (
        <Home
          count={available.length}
          onStart={() => go("setup")}
          onHistory={() => go("history")}
          onRules={() => go("rules")}
        />
      )}
      {page === "setup" && (
        <PlayerSetup
          count={Math.min(available.length, config.questionCount)}
          onRules={() => go("rules")}
          onEnter={(name) => {
            const selected = selectQuestions(auditedQuestions);
            if (!selected.length) return;
            setNickname(name);
            setQuestions(selected);
            setPage("quiz");
          }}
        />
      )}
      {page === "rules" && (
        <Rules count={available.length} onStart={() => go("setup")} />
      )}
      {page === "quiz" && (
        <Quiz
          nickname={nickname}
          questions={questions}
          onFinish={(value) => {
            setResult(value);
            setSaved(saveResult(value));
            setPage("result");
          }}
        />
      )}
      {page === "result" && result && (
        <Result
          result={result}
          saved={saved}
          onRetry={() => go("setup")}
          onHistory={() => go("history")}
        />
      )}
      {page === "history" && (
        <History
          onStart={() => go("setup")}
          onOpen={(value) => {
            setResult(value);
            setSaved(true);
            setPage("result");
          }}
        />
      )}
      <footer>
        <span>© DOGHOUSE CUP · 狗窝内部娱乐</span>
        <span>非 Riot Games 官方赛事</span>
      </footer>
    </div>
  );
}
