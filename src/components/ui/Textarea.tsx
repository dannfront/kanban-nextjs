"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-bold text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "min-h-[112px] w-full resize-none rounded border border-[var(--color-lines-dark)]/25 bg-transparent px-4 py-2 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-main-purple)]",
            error && "border-[var(--color-red)]"
          )}
          {...props}
        />
        {error && (
          <p className="text-[13px] font-medium text-[var(--color-red)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
