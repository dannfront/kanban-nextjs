import { prisma } from "@/lib/prisma";

export async function softDeleteBoard(boardId: string): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.board.updateMany({
      where: { id: boardId },
      data: { deletedAt: now },
    }),
    prisma.column.updateMany({
      where: { boardId },
      data: { deletedAt: now },
    }),
    prisma.task.updateMany({
      where: { column: { boardId } },
      data: { deletedAt: now },
    }),
    prisma.subtask.updateMany({
      where: { task: { column: { boardId } } },
      data: { deletedAt: now },
    }),
  ]);
}

export async function softDeleteColumn(columnId: string): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.column.updateMany({
      where: { id: columnId },
      data: { deletedAt: now },
    }),
    prisma.task.updateMany({
      where: { columnId },
      data: { deletedAt: now },
    }),
    prisma.subtask.updateMany({
      where: { task: { columnId } },
      data: { deletedAt: now },
    }),
  ]);
}

export async function softDeleteTask(taskId: string): Promise<void> {
  const now = new Date();

  await prisma.$transaction([
    prisma.task.updateMany({
      where: { id: taskId },
      data: { deletedAt: now },
    }),
    prisma.subtask.updateMany({
      where: { taskId },
      data: { deletedAt: now },
    }),
  ]);
}

export async function softDeleteSubtask(subtaskId: string): Promise<void> {
  const now = new Date();

  await prisma.subtask.updateMany({
    where: { id: subtaskId },
    data: { deletedAt: now },
  });
}
