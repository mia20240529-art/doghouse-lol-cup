import config from "../data/config.json";
import { Trophy, ArrowUpRight, History, BookOpen } from "lucide-react";

export default function Home({
  onStart,
  onHistory,
  onRules,
  count,
}: {
  onStart: () => void;
  onHistory: () => void;
  onRules: () => void;
  count: number;
}) {
  return (
    <>
      <main className="home">
        <div className="eyebrow">
          PRIVATE TOURNAMENT <span>狗窝内部邀请赛</span>
        </div>
        <div className="hero-grid">
          <section className="hero-copy">
            <p className="league">LEAGUE OF LEGENDS</p>
            <h1>
              🐶 狗窝杯
              <span>
                峡谷知识<span className="gold">问答大赛</span>
              </span>
            </h1>
            <p className="tagline">“请证明你不是云玩家”</p>
            <p className="intro">
              操作可以下饭，理论必须到位。
              <br />
              你的峡谷理解，今天见真章。
            </p>
            <div className="home-actions">
              <button className="primary" onClick={onStart}>
                开始考试
                <ArrowUpRight />
              </button>
              <button className="secondary" onClick={onHistory}>
                <History size={18} />
                历史成绩
              </button>
              <button className="text-button" onClick={onRules}>
                <BookOpen size={18} />
                比赛规则
              </button>
            </div>
          </section>
          <aside className="event-panel">
            <div className="panel-top">
              OFFICIAL CHALLENGE <span>01</span>
            </div>
            <div className="trophy-emblem">
              <Trophy strokeWidth={1} />
            </div>
            <p className="panel-caption">THE KNOWLEDGE IS YOUR WEAPON</p>
            <div className="event-title">实力，藏不住。</div>
            <div className="event-meta">
              <span>
                参赛门槛<strong>敢来就行</strong>
              </span>
              <span>
                考试纪律<strong>禁止搜索</strong>
              </span>
            </div>
          </aside>
        </div>
        <div className="format-strip">
          <div>
            <b>
              {config.questionCount}
              <small>题</small>
            </b>
            <span>随机抽题 · 每局不同</span>
          </div>
          <div>
            <b>
              04<small>档</small>
            </b>
            <span>困难起步 · 上不封顶</span>
          </div>
          <div>
            <b>
              15–30<small>秒</small>
            </b>
            <span>限时作答 · 不留借口</span>
          </div>
          <div className="bank-status">
            <span className="status-dot" />
            <div>
              {count ? `已审核 ${count} 道题` : "题库审核中"}
              <small>
                {count
                  ? `本局将随机抽取 ${Math.min(count, config.questionCount)} 道题`
                  : "狗窝委员会还没有审核题目。"}
              </small>
            </div>
          </div>
        </div>
        <div className="home-bottom">
          <span>NO SEARCH. NO EXCUSES.</span>
          <p>
            禁止搜索 <i>/</i> 搜了也不一定搜得对
          </p>
        </div>
      </main>
    </>
  );
}
