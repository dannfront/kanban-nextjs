"use client";

import type { RefObject, ReactNode } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function DropdownMenu({
  isOpen,
  onClose,
  children,
  className,
  containerRef,
}: DropdownMenuProps) {
  useClickOutside(containerRef, onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute right-0 top-10 z-10 w-40 rounded-lg bg-[var(--color-bg-modal)] py-2 shadow-[0_4px_6px_rgba(0,0,0,0.1)] ring-1 ring-[var(--color-lines-dark)]",
        className
      )}
    >
      {children}
    </div>
  );
}
