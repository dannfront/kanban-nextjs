"use client";

import { useMemo } from "react";
import type { ColorRepository } from "./types";
import { RandomColorRepository } from "./random-color.repository";

let instance: RandomColorRepository | null = null;

function getInstance(): RandomColorRepository {
  if (!instance) {
    instance = new RandomColorRepository();
  }
  return instance;
}

export function useColor(): ColorRepository {
  return useMemo(() => getInstance(), []);
}
