"use client";

import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold text-[var(--color-red)]">
        Dashboard Error
      </h1>
      <p className="max-w-md text-center text-[13px] leading-[23px] text-[var(--color-text-secondary)]">
        The dashboard could not be loaded. Please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Error ID: {error.digest}
        </p>
      )}
      <Button variant="primary" size="lg" onClick={reset}>
        Try Again
      </Button>
    </main>
  );
}
