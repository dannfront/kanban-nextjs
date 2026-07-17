import "server-only";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  return session.user.id;
}

export async function requireBoardOwnership(boardId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const board = await prisma.board.findFirst({
    where: { id: boardId, deletedAt: null },
    select: { ownerId: true },
  });

  if (!board || board.ownerId !== userId) {
    throw new Error("Unauthorized: board not owned by current user");
  }
}

export async function findBoardIdForColumn(
  columnId: string
): Promise<string | null> {
  const column = await prisma.column.findFirst({
    where: { id: columnId, deletedAt: null },
    select: { boardId: true },
  });
  return column?.boardId ?? null;
}

export async function findBoardIdForTask(
  taskId: string
): Promise<string | null> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    select: { column: { select: { boardId: true } } },
  });
  return task?.column.boardId ?? null;
}

export async function findBoardIdForSubtask(
  subtaskId: string
): Promise<string | null> {
  const subtask = await prisma.subtask.findFirst({
    where: { id: subtaskId, deletedAt: null },
    select: { task: { select: { column: { select: { boardId: true } } } } },
  });
  return subtask?.task.column.boardId ?? null;
}
