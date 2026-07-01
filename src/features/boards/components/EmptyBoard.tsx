import { Button } from "@/components/ui/Button";

export function EmptyBoard() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
      <p className="text-center text-lg font-bold text-[var(--color-medium-gray)]">
        This board is empty. Create a new column to get started.
      </p>
      <Button size="lg" disabled>
        + Add New Column
      </Button>
    </div>
  );
}
