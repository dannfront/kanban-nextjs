export const GAP = 1000;

export function computeInsertOrder(
  prev: number | null,
  next: number | null
): number {
  if (prev === null) {
    return next === null ? GAP : Math.floor(next / 2);
  }

  if (next === null) {
    return prev + GAP;
  }

  return Math.floor((prev + next) / 2);
}
