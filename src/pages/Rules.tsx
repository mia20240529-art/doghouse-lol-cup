import config from "../data/config.json";
export default function Rules({
  count,
  onStart,
}: {
  count: number;
  onStart: () => void;
}) {
  return (
    <main className="content-page enter">
      <p className="kicker">TOURNAMENT RULEBOOK</p>
      <h1 className="page-title">懂规则，再上场。</h1>
      <p className="page-intro">狗窝内部娱乐，认真程度由你决定。</p>
      <div className="rules-grid">
        <section className="card">
          <span className="rule-number">01 / FORMAT</span>
          <h2>比赛怎么打</h2>
          <p>
            默认随机抽取 {config.questionCount}{" "}
            道已启用、已审核的题目，尽量均衡类别。同一局不重复，题库不足时按实际数量开赛。
          </p>
          <p>
            当前可用 <strong className="gold">{count}</strong>{" "}
            道题。支持单选、多选、判断与情景机制题。多选必须全部选对；提交后锁定答案，超时自动判错。切换后台仍会计时。
          </p>
        </section>
        <section className="card">
          <span className="rule-number">02 / DIFFICULTY</span>
          <h2>困难，只是起点</h2>
          <div className="difficulty-table">
            {Object.entries(config.difficulties).map(([key, d]) => (
              <div key={key}>
                <span className={`difficulty ${key}`}>{d.label}</span>
                <span>{d.score} 分</span>
                <span>{d.timeLimit} 秒</span>
              </div>
            ))}
          </div>
          <small className="muted">
            题目若单独设置分数、时间，以该题配置为准。
          </small>
        </section>
        <section className="card">
          <span className="rule-number">03 / SCORING</span>
          <h2>理解优先，手速加分</h2>
          <p>
            答对获得基础分，时间奖励 = 剩余时间比例 × 基础分 ×
            15%，四舍五入。答错或超时得 0 分。
          </p>
          <p>
            连续答对第 3 题奖励 50 分，第 5 题奖励 100 分；第 8
            题进入「狗窝暴走」，从第 9
            题起，后续连续正确题目的基础分与时间奖励之和 ×1.2，再四舍五入。
          </p>
          <p>答错立即清零 Combo。里程碑奖励每段连胜各触发一次。</p>
        </section>
        <section className="card">
          <span className="rule-number">04 / HOUSE RULES</span>
          <h2>狗窝公约</h2>
          <p>禁止搜索，禁止代答。搜了也不一定搜得对。</p>
          <p>
            每人在自己的设备上考试。历史成绩属于当前浏览器，没有跨设备榜单。退出或刷新会放弃未完成的一局，完成后才保存成绩。
          </p>
          <p>这是朋友间的娱乐比赛，请自行遵守规则。</p>
        </section>
      </div>
      <button className="primary" onClick={onStart}>
        开始考试
      </button>
    </main>
  );
}
