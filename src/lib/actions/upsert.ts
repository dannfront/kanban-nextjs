import "server-only";
import type { Prisma } from "@prisma/client";
import { GAP } from "@/lib/actions/ordering";

export async function upsertColumns(
  tx: Prisma.TransactionClient,
  boardId: string,
  columns: Array<{ id?: string; name: string; color?: string }>,
  startOrder: number
): Promise<void> {
  let nextOrder = startOrder;
  for (const column of columns) {
    if (column.id) {
      const updated = await tx.column.updateMany({
        where: { id: column.id, boardId, deletedAt: null },
        data: {
          name: column.name,
          ...(column.color !== undefined && { color: column.color }),
        },
      });
      if (updated.count === 0) {
        throw new Error("Column not found");
      }
    } else {
      await tx.column.create({
        data: {
          boardId,
          name: column.name,
          color: column.color ?? "#6B7280",
          order: nextOrder,
        },
      });
      nextOrder += GAP;
    }
  }
}

export async function upsertSubtasks(
  tx: Prisma.TransactionClient,
  taskId: string,
  subtasks: Array<{ id?: string; title: string }>
): Promise<void> {
  for (const subtask of subtasks) {
    if (subtask.id) {
      const updated = await tx.subtask.updateMany({
        where: { id: subtask.id, taskId, deletedAt: null },
        data: { title: subtask.title },
      });
      if (updated.count === 0) {
        throw new Error("Subtask not found");
      }
    } else {
      await tx.subtask.create({
        data: { taskId, title: subtask.title },
      });
    }
  }
}
