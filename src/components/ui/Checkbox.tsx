"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import iconCheck from "@/assets/icon-check.svg";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  strikethroughWhenChecked?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  strikethroughWhenChecked = false,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn("flex cursor-pointer items-center gap-4", className)}
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--color-medium-gray)]/25 bg-white transition-colors has-[:checked]:border-[var(--color-main-purple)] has-[:checked]:bg-[var(--color-main-purple)] dark:bg-[var(--color-dark-gray-2)]">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <Image
          src={iconCheck}
          alt=""
          width={10}
          height={8}
          className="pointer-events-none opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span
        className={cn(
          "text-xs font-bold transition-colors",
          strikethroughWhenChecked && checked
            ? "text-[var(--color-medium-gray)] line-through"
            : "text-[var(--color-text-primary)]"
        )}
      >
        {label}
      </span>
    </label>
  );
}
