"use client";

import { useMemo } from "react";
import type { NotificationRepository } from "./types";
import { ReactHotToastRepository } from "./react-hot-toast.repository";

let instance: ReactHotToastRepository | null = null;

function getInstance(): ReactHotToastRepository {
  if (!instance) {
    instance = new ReactHotToastRepository();
  }
  return instance;
}

export function useNotify(): NotificationRepository {
  return useMemo(() => getInstance(), []);
}
