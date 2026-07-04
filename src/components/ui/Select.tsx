"use client";

import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: SelectOption[];
  id?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  label,
  options,
  id,
  className,
}: SelectProps) {
  return (
    <>
      <label
        htmlFor={id}
        className="text-xs font-bold text-[var(--color-text-secondary)]"
      >
        {label}
      </label>
      <div className={cn("relative", className)}>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded border border-[var(--color-lines-dark)]/25 bg-transparent px-4 py-2 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-main-purple)]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-[var(--color-main-purple)]" />
      </div>
    </>
  );
}
