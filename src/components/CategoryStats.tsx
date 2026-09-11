import config from "../data/config.json";
import { categoryLabel } from "../utils/scoring";
import type { CategoryStat } from "../types/result";
export default function CategoryStats({
  stats,
}: {
  stats: Record<string, CategoryStat>;
}) {
  const categories = [
    ...new Set([...Object.keys(config.categoryLabels), ...Object.keys(stats)]),
  ];
  return (
    <section className="card">
      <p className="kicker">KNOWLEDGE BREAKDOWN</p>
      <h2>峡谷知识分布</h2>
      <div className="category-grid">
        {categories.map((category) => {
          const stat = stats[category];
          const rate = stat?.total ? (stat.correct / stat.total) * 100 : 0;
          return (
            <div className="category-item" key={category}>
              <div>
                <span>{categoryLabel(category)}</span>
                <small>
                  {stat?.total
                    ? `${stat.correct}/${stat.total} · ${Math.round(rate)}%`
                    : "本局未抽到"}
                </small>
              </div>
              <div
                className="category-track"
                role="progressbar"
                aria-label={categoryLabel(category)}
                aria-valuenow={rate}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${rate}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
