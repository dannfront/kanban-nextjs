import { cn } from "@/lib/utils";

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-bold text-[var(--color-text-primary)]",
        className
      )}
    >
      {children}
    </h2>
  );
}
