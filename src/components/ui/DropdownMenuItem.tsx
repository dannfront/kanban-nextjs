"use client";

import { cn } from "@/lib/utils";

interface DropdownMenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "destructive";
}

export function DropdownMenuItem({
  onClick,
  children,
  variant = "default",
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer px-4 py-2 text-left text-[13px] font-medium transition-colors hover:bg-black/5",
        variant === "destructive"
          ? "text-[var(--color-red)]"
          : "text-[var(--color-medium-gray)]",
      )}
    >
      {children}
    </button>
  );
}
