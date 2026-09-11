import { Flame } from "lucide-react";
import { useMemo } from "react";
import { pickQuote } from "../utils/scoring";
export default function ComboBadge({ combo }: { combo: number }) {
  const quote = useMemo(() => (combo >= 3 ? pickQuote("combo") : ""), [combo]);
  if (combo < 3) return null;
  return (
    <span
      key={combo}
      className={`combo-badge ${combo >= 8 ? "rampage" : ""}`}
      title={quote}
    >
      <Flame size={18} />
      {combo >= 8 ? "狗窝暴走 · " : ""}Combo ×{combo}
      <small className="combo-quote">{quote}</small>
    </span>
  );
}
