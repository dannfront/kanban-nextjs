"use client";

import Image from "next/image";
import iconVerticalEllipsis from "@/assets/icon-vertical-ellipsis.svg";

interface KebabMenuButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  ariaExpanded?: boolean;
}

export function KebabMenuButton({
  onClick,
  ariaLabel = "More actions",
  ariaExpanded,
}: KebabMenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10"
    >
      <Image src={iconVerticalEllipsis} alt="" width={5} height={20} />
    </button>
  );
}
