"use client";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="h-full min-h-full font-sans"
        style={{
          background: "var(--color-bg-body, #F4F7FD)",
          color: "var(--color-text-primary, #000112)",
          fontFamily:
            '"Plus Jakarta Sans", Arial, Helvetica, sans-serif',
        }}
      >
        <main className="flex h-full flex-col items-center justify-center gap-6 px-4">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-red, #EA5555)" }}
          >
            Something went wrong
          </h1>
          <p
            className="max-w-md text-center text-[13px] leading-[23px]"
            style={{ color: "var(--color-text-secondary, #828FA3)" }}
          >
            A critical error occurred. Please try again.
          </p>
          {error.digest && (
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary, #828FA3)" }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-main-purple,#635FC7)] px-6 text-[0.9375rem] font-bold text-white transition-colors hover:bg-[var(--color-main-purple-hover,#A8A4FF)]"
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
