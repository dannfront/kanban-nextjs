import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-[var(--color-main-purple)] border-t-transparent",
          sizeMap[size],
        )}
      />
      {label && (
        <p className="text-sm font-medium text-[var(--color-medium-gray)]">
          {label}
        </p>
      )}
    </div>
  );
}
