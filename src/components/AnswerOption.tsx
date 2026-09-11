import { Check, X } from "lucide-react";
interface Props {
  label: string;
  index: number;
  multiple: boolean;
  selected: boolean;
  locked: boolean;
  correct: boolean;
  onSelect: () => void;
}
export default function AnswerOption({
  label,
  index,
  multiple,
  selected,
  locked,
  correct,
  onSelect,
}: Props) {
  const status = locked
    ? correct
      ? "is-correct"
      : selected
        ? "is-wrong"
        : ""
    : selected
      ? "is-selected"
      : "";
  const content = (
    <>
      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
      <span className="option-label">{label}</span>
      {locked && correct ? (
        <Check size={20} />
      ) : locked && selected ? (
        <X size={20} />
      ) : null}
    </>
  );
  if (multiple)
    return (
      <label className={`answer-option ${status} ${locked ? "locked" : ""}`}>
        <input
          type="checkbox"
          checked={selected}
          disabled={locked}
          onChange={onSelect}
        />
        {content}
      </label>
    );
  return (
    <button
      className={`answer-option ${status}`}
      disabled={locked}
      onClick={onSelect}
    >
      {content}
    </button>
  );
}
