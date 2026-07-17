"use server";
import "server-only";

import { BoardRole, type Board, type Column } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResult, validateInput } from "@/lib/actions/result";
import { softDeleteBoard } from "@/lib/actions/soft-delete";
import { requireBoardOwnership, getCurrentUserId } from "@/lib/authz";
import { defineAction } from "@/lib/actions/define-action";
import { GAP, computeNextOrder } from "@/lib/actions/ordering";
import { upsertColumns } from "@/lib/actions/upsert";
import {
  CreateBoardSchema,
  UpdateBoardSchema,
  BoardIdSchema,
} from "./schemas";

type BoardWithColumns = Board & {
  columns: (Column & { _count: { tasks: number } })[];
};

export const createBoard = defineAction({
  validate: (input: unknown) => validateInput(CreateBoardSchema, input),
  handler: async ({ name, columns }) => {
    const userId = await getCurrentUserId();

    const board = await prisma.$transaction(async (tx) => {
      const newBoard = await tx.board.create({
        data: { name, ownerId: userId },
      });

      await tx.column.createMany({
        data: columns.map((column, index) => ({
          boardId: newBoard.id,
          name: column.name,
          color: column.color,
          order: (index + 1) * GAP,
        })),
      });

      await tx.boardMember.create({
        data: {
          boardId: newBoard.id,
          userId: userId,
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

    if (!board) return { success: false, error: "Failed to create board" };
    return { success: true, data: board };
  },
  errorLabel: "Failed to create board",
});

export const updateBoard = defineAction({
  validate: (boardId: unknown, input: unknown) => {
    const idResult = validateInput(BoardIdSchema, { boardId });
    if (!idResult.ok) return idResult;
    const inputResult = validateInput(UpdateBoardSchema, input);
    if (!inputResult.ok) return inputResult;
    return { ok: true, data: { boardId: idResult.data.boardId, ...inputResult.data } };
  },
  handler: async ({ boardId, name, columns }) => {
    await requireBoardOwnership(boardId);

    try {
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
          const startOrder = computeNextOrder(lastColumn?.order ?? null);
          await upsertColumns(tx, boardId, columns, startOrder);
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

      if (!board) return { success: false, error: "Board not found" };
      return { success: true, data: board };
    } catch (error) {
      if (error instanceof Error && error.message === "Column not found") {
        return { success: false, error: "Column not found" };
      }
      throw error;
    }
  },
  errorLabel: "Failed to update board",
});

export const deleteBoard = defineAction({
  validate: (boardId: unknown) => validateInput(BoardIdSchema, { boardId }),
  handler: async ({ boardId }) => {
    await requireBoardOwnership(boardId);
    await softDeleteBoard(boardId);
    return { success: true, data: undefined };
  },
  errorLabel: "Failed to delete board",
});

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
