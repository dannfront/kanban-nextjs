import "server-only";

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

export function isOrderCollision(
  prev: number | null,
  next: number | null,
  newOrder: number
): boolean {
  if (newOrder === prev || newOrder === next) return true;
  if (prev !== null && next !== null && (next - prev) <= 1) return true;
  return false;
}
