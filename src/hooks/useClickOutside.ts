"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void,
  active = true
) {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    if (!active) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callbackRef.current();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [active]);
}
