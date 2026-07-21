import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

type ButtonVariant = "primary" | "secondary" | "destructive";
type ButtonSize = "lg" | "sm" | "icon" | "xs";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
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
  xs: "h-8 px-4 text-[0.75rem] font-bold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "lg",
      children,
      disabled,
      loading,
      ...props
    },
    ref,
  ) => {
    const spinnerSize = size === "xs" ? 14 : size === "sm" ? 16 : 20;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? <Spinner size={spinnerSize} /> : children}
      </button>
    );
  },
);

Button.displayName = "Button";
