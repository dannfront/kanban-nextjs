import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "destructive";
type ButtonSize = "lg" | "sm" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-main-purple)] text-white hover:bg-[var(--color-main-purple-hover)]",
  secondary:
    "bg-[var(--color-main-purple)]/10 text-[var(--color-main-purple)] hover:bg-[var(--color-main-purple)]/25",
  destructive:
    "bg-[var(--color-red)] text-white hover:bg-[var(--color-red-hover)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "h-12 px-6 text-[0.9375rem] font-bold",
  sm: "h-10 px-6 text-[0.8125rem] font-bold",
  icon: "h-12 w-12 items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "lg",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
