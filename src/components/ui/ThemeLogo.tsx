"use client";

import { useTheme } from "next-themes";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";

export function ThemeLogo() {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === "light" ? logoDark.src : logoLight.src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt="Kanban"
      width={153}
      height={26}
      className="h-[26px] w-[153px]"
    />
  );
}
