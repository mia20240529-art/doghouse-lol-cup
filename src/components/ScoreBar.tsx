import ComboBadge from "./ComboBadge";
export default function ScoreBar({
  index,
  total,
  score,
  combo,
}: {
  index: number;
  total: number;
  score: number;
  combo: number;
}) {
  return (
    <div className="score-bar">
      <div>
        <span className="kicker">DOGHOUSE CUP</span>
        <p>
          第 <strong>{index + 1}</strong> / {total} 题
        </p>
      </div>
      <ComboBadge combo={combo} />
      <div className="current-score">
        <span>当前总分</span>
        <strong>{score.toLocaleString()}</strong>
      </div>
    </div>
  );
}
