interface SubtaskCounterProps {
  completed: number;
  total: number;
  variant?: "label" | "sentence";
}

export function SubtaskCounter({
  completed,
  total,
  variant = "label",
}: SubtaskCounterProps) {
  if (variant === "sentence") {
    return (
      <p className="text-[12px] font-bold text-[var(--color-text-secondary)]">
        {completed} of {total} subtasks
      </p>
    );
  }

  return (
    <p className="text-xs font-bold text-[var(--color-text-secondary)]">
      Subtasks ({completed} of {total})
    </p>
  );
}
