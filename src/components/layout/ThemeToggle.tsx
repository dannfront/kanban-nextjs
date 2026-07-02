"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { cn } from "@/lib/utils";
import iconLightTheme from "@/assets/icon-light-theme.svg";
import iconDarkTheme from "@/assets/icon-dark-theme.svg";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-center gap-6 rounded-md bg-[var(--color-bg-body)] py-3.5">
      <Image src={iconLightTheme} alt="" width={19} height={19} />
      <button
        type="button"
        role="switch"
        aria-checked={mounted ? isDark : true}
        aria-label="Toggle theme"
        onClick={toggle}
        className="relative h-5 w-10 rounded-full bg-[var(--color-main-purple)] transition-colors"
      >
        <span
          className={cn(
            "absolute top-1/2 block h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition-transform",
            mounted && isDark ? "right-1" : "left-1"
          )}
        />
      </button>
      <Image src={iconDarkTheme} alt="" width={16} height={16} />
    </div>
  );
}
