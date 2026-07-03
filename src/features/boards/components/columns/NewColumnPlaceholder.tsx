export function NewColumnPlaceholder() {
  return (
    <div className="flex h-full w-[280px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-column-placeholder)]">
      <span className="text-xl font-bold text-[var(--color-medium-gray)]">
        + New Column
      </span>
    </div>
  );
}
