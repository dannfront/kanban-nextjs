"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";

export function StoreHydration() {
  useEffect(() => {
    void useUIStore.persist.rehydrate();
  }, []);

  return null;
}
