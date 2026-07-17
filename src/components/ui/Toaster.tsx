"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--color-bg-modal)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-lines-dark)",
          fontSize: "13px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: "#635FC7",
            secondary: "#A8A4FF",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#EA5555",
            secondary: "#FF9898",
          },
        },
      }}
    />
  );
}
