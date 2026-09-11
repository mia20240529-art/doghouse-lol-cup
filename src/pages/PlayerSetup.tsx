import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { readPlayer, savePlayer } from "../utils/storage";
export default function PlayerSetup({
  count,
  onEnter,
  onRules,
}: {
  count: number;
  onEnter: (nickname: string) => void;
  onRules: () => void;
}) {
  const [nickname, setNickname] = useState(readPlayer);
  const [error, setError] = useState("");
  return (
    <main className="narrow-page enter">
      <p className="kicker">PLAYER CHECK-IN</p>
      <h1 className="page-title">先报上你的大名。</h1>
      <p className="page-intro">今天的成绩，将成为明天的聊天素材。</p>
      <form
        className="card setup-form"
        onSubmit={(event) => {
          event.preventDefault();
          const name = nickname.trim();
          if (!name) {
            setError("请输入昵称，别让狗窝查无此人。");
            return;
          }
          if (count === 0) return;
          savePlayer(name);
          onEnter(name);
        }}
      >
        <label htmlFor="nickname">参赛昵称</label>
        <input
          id="nickname"
          autoComplete="nickname"
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            setError("");
          }}
          maxLength={24}
          placeholder="例如：马哥"
          required
          aria-describedby="nickname-help"
        />
        <small id="nickname-help">最多 24 个字符 · 下次自动记住</small>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="check-in-info">
          <ShieldCheck size={20} />
          <span>本局 {count} 道题 · 独立作答 · 禁止搜索</span>
        </div>
        {count === 0 && (
          <div className="notice" role="status">
            狗窝委员会还没有审核题目。
          </div>
        )}
        <button
          className="primary full-width"
          type="submit"
          disabled={count === 0}
        >
          进入狗窝杯
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          className="text-button full-width"
          onClick={onRules}
        >
          先看比赛规则
        </button>
      </form>
      <p className="local-note">昵称与成绩只保存在当前浏览器。</p>
    </main>
  );
}
