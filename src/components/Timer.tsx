export default function Timer({
  remaining,
  limit,
  stopped,
}: {
  remaining: number;
  limit: number;
  stopped: boolean;
}) {
  return (
    <div
      className={`timer ${remaining <= 5 && !stopped ? "urgent" : ""}`}
      aria-label={`剩余 ${Math.ceil(remaining)} 秒`}
    >
      <div className="timer-label">
        <span>{stopped ? "作答已结束" : "剩余时间"}</span>
        <strong>
          {Math.ceil(remaining).toString().padStart(2, "0")}
          <small> 秒</small>
        </strong>
      </div>
      <div
        className="timer-track"
        role="progressbar"
        aria-label="剩余答题时间"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={remaining}
      >
        <span style={{ width: `${Math.max(0, (remaining / limit) * 100)}%` }} />
      </div>
    </div>
  );
}
