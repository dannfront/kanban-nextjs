"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg";

const sizeClassMap: Record<ModalSize, string> = {
  sm: "max-w-[264px]",
  md: "max-w-[480px]",
  lg: "max-w-[640px]",
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: ModalSize;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  size = "sm",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className={cn(
          "w-full mx-4 rounded-lg bg-[var(--color-bg-sidebar)]",
          sizeClassMap[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
