"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold text-[var(--color-main-purple)]">
        Page not found
      </h1>
      <p className="max-w-md text-center text-[13px] leading-[23px] text-[var(--color-medium-gray)]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg">
          Go to Home
        </Button>
      </Link>
    </main>
  );
}
