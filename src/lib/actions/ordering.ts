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

export function computeNextOrder(lastOrder: number | null): number {
  return lastOrder === null ? GAP : lastOrder + GAP;
}

export function computeMoveOrder(
  tasks: Array<{ order: number }>,
  newIndex: number
): { order: number; needsRebalance: boolean } {
  let newOrder: number;

  if (tasks.length === 0) {
    newOrder = GAP;
  } else if (newIndex === 0) {
    newOrder = computeInsertOrder(null, tasks[0].order);
  } else if (newIndex >= tasks.length) {
    newOrder = computeInsertOrder(tasks[tasks.length - 1].order, null);
  } else {
    newOrder = computeInsertOrder(tasks[newIndex - 1].order, tasks[newIndex].order);
  }

  const prev = newIndex === 0 ? null : tasks[newIndex - 1]?.order ?? null;
  const next = newIndex >= tasks.length ? null : tasks[newIndex]?.order ?? null;
  const needsRebalance = isOrderCollision(prev, next, newOrder);

  return { order: newOrder, needsRebalance };
}

export function buildReorderUpdates(
  orderedIds: string[]
): Array<{ id: string; order: number }> {
  return orderedIds.map((id, index) => ({ id, order: (index + 1) * GAP }));
}
