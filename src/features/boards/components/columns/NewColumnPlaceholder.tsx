import type { ButtonHTMLAttributes } from "react";

export function NewColumnPlaceholder(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      type="button"
      {...props}
      className="flex h-full w-[280px] shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[var(--color-bg-column-placeholder)] transition-opacity hover:opacity-80"
    >
      <span className="text-xl font-bold text-[var(--color-medium-gray)]">
        + New Column
      </span>
    </button>
  );
}
