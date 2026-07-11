"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import { BoardRole, type Board, type Column } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResult, validateInput } from "@/lib/actions/result";
import { softDeleteBoard } from "@/lib/actions/soft-delete";
import { getSeedUserId, requireBoardOwnership, getCurrentUserId } from "@/lib/auth";
import {
  CreateBoardSchema,
  UpdateBoardSchema,
  BoardIdSchema,
} from "./schemas";

const REVALIDATE_PATH = "/kanban-dashboard";

type BoardWithColumns = Board & {
  columns: (Column & { _count: { tasks: number } })[];
};

export async function createBoard(
  input: unknown
): Promise<ActionResult<Board & { columns: Column[] }>> {
  const validation = validateInput(CreateBoardSchema, input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const seedUserId = await getSeedUserId();
    const { name, columns } = validation.data;

    const board = await prisma.$transaction(async (tx) => {
      const newBoard = await tx.board.create({
        data: { name, ownerId: seedUserId },
      });

      await tx.column.createMany({
        data: columns.map((column, index) => ({
          boardId: newBoard.id,
          name: column.name,
          color: column.color,
          order: (index + 1) * 1000,
        })),
      });

      await tx.boardMember.create({
        data: {
          boardId: newBoard.id,
          userId: seedUserId,
          role: BoardRole.OWNER,
        },
      });

      return tx.board.findUnique({
        where: { id: newBoard.id },
        include: {
          columns: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    if (!board) {
      return { success: false, error: "Failed to create board" };
    }

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: board };
  } catch (error) {
    console.error("createBoard failed:", error);
    return { success: false, error: "Failed to create board" };
  }
}

export async function updateBoard(
  boardId: string,
  input: unknown
): Promise<ActionResult<Board & { columns: Column[] }>> {
  const idValidation = validateInput(BoardIdSchema, { boardId });
  if (!idValidation.ok) {
    return { success: false, error: idValidation.error };
  }

  const inputValidation = validateInput(UpdateBoardSchema, input);
  if (!inputValidation.ok) {
    return { success: false, error: inputValidation.error };
  }

  try {
    await requireBoardOwnership(boardId);
    const { name, columns } = inputValidation.data;

    const board = await prisma.$transaction(async (tx) => {
      if (name !== undefined) {
        await tx.board.update({
          where: { id: boardId },
          data: { name },
        });
      }

      if (columns && columns.length > 0) {
        const lastColumn = await tx.column.findFirst({
          where: { boardId, deletedAt: null },
          orderBy: { order: "desc" },
        });
        let nextOrder = lastColumn ? lastColumn.order + 1000 : 1000;

        for (const column of columns) {
          if (column.id) {
            const updated = await tx.column.updateMany({
              where: { id: column.id, boardId },
              data: { name: column.name, color: column.color },
            });
            if (updated.count === 0) {
              throw new Error("Column not found");
            }
          } else {
            await tx.column.create({
              data: {
                boardId,
                name: column.name,
                color: column.color,
                order: nextOrder,
              },
            });
            nextOrder += 1000;
          }
        }
      }

      return tx.board.findUnique({
        where: { id: boardId },
        include: {
          columns: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    if (!board) {
      return { success: false, error: "Board not found" };
    }

    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: board };
  } catch (error) {
    console.error("updateBoard failed:", error);
    return { success: false, error: "Failed to update board" };
  }
}

export async function deleteBoard(boardId: string): Promise<ActionResult<void>> {
  const validation = validateInput(BoardIdSchema, { boardId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    await requireBoardOwnership(boardId);
    await softDeleteBoard(boardId);
    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteBoard failed:", error);
    return { success: false, error: "Failed to delete board" };
  }
}

export async function getBoards(): Promise<ActionResult<Board[]>> {
  try {
    const userId = await getCurrentUserId();
    const boards = await prisma.board.findMany({
      where: { deletedAt: null, ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: boards as Board[] };
  } catch (error) {
    console.error("getBoards failed:", error);
    return { success: false, error: "Failed to fetch boards" };
  }
}

export async function getBoardWithColumns(
  boardId: string
): Promise<ActionResult<BoardWithColumns>> {
  const validation = validateInput(BoardIdSchema, { boardId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    await requireBoardOwnership(boardId);

    const board = await prisma.board.findUnique({
      where: { id: boardId, deletedAt: null },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        columns: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
          select: {
            id: true,
            boardId: true,
            name: true,
            color: true,
            order: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { tasks: { where: { deletedAt: null } } },
            },
          },
        },
      },
    });

    if (!board) {
      return { success: false, error: "Board not found" };
    }

    return { success: true, data: board as unknown as BoardWithColumns };
  } catch (error) {
    console.error("getBoardWithColumns failed:", error);
    return { success: false, error: "Failed to fetch board" };
  }
}
