"use server";

import { revalidatePath } from "next/cache";
import { type Column } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResult, validateInput } from "@/lib/actions/result";
import { softDeleteColumn } from "@/lib/actions/soft-delete";
import { requireBoardOwnership, findBoardIdForColumn } from "@/lib/auth";
import { GAP } from "@/lib/actions/ordering";
import {
  CreateColumnSchema,
  UpdateColumnSchema,
  ColumnIdSchema,
  ReorderColumnsSchema,
} from "./schemas";

const REVALIDATE_PATH = "/kanban-dashboard";
const ORDER_GAP = GAP;

export async function createColumn(
  input: unknown
): Promise<ActionResult<Column>> {
  const validation = validateInput(CreateColumnSchema, input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    await requireBoardOwnership(validation.data.boardId);
    const { boardId, name, color, order } = validation.data;

    let columnOrder = order;
    if (columnOrder === undefined) {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId, deletedAt: null },
        orderBy: { order: "desc" },
      });
      columnOrder = lastColumn ? lastColumn.order + ORDER_GAP : ORDER_GAP;
    }

    const column = await prisma.column.create({
      data: { boardId, name, color, order: columnOrder },
    });

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: column };
  } catch (error) {
    console.error("createColumn failed:", error);
    return { success: false, error: "Failed to create column" };
  }
}

export async function updateColumn(
  columnId: string,
  input: unknown
): Promise<ActionResult<Column>> {
  const idValidation = validateInput(ColumnIdSchema, { columnId });
  if (!idValidation.ok) {
    return { success: false, error: idValidation.error };
  }

  const inputValidation = validateInput(UpdateColumnSchema, input);
  if (!inputValidation.ok) {
    return { success: false, error: inputValidation.error };
  }

  try {
    const boardId = await findBoardIdForColumn(columnId);
    if (!boardId) {
      return { success: false, error: "Column not found" };
    }
    await requireBoardOwnership(boardId);

    const column = await prisma.column.update({
      where: { id: columnId },
      data: inputValidation.data,
    });

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: column };
  } catch (error) {
    console.error("updateColumn failed:", error);
    return { success: false, error: "Failed to update column" };
  }
}

export async function deleteColumn(
  columnId: string
): Promise<ActionResult<void>> {
  const validation = validateInput(ColumnIdSchema, { columnId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const boardId = await findBoardIdForColumn(columnId);
    if (!boardId) {
      return { success: false, error: "Column not found" };
    }
    await requireBoardOwnership(boardId);
    await softDeleteColumn(columnId);
    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteColumn failed:", error);
    return { success: false, error: "Failed to delete column" };
  }
}

export async function reorderColumns(
  boardId: string,
  orderedColumnIds: string[]
): Promise<ActionResult<void>> {
  const validation = validateInput(ReorderColumnsSchema, {
    boardId,
    orderedColumnIds,
  });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    await requireBoardOwnership(boardId);

    const matching = await prisma.column.count({
      where: { id: { in: orderedColumnIds }, boardId, deletedAt: null },
    });
    if (matching !== orderedColumnIds.length) {
      return { success: false, error: "Some columns do not belong to this board" };
    }

    await prisma.$transaction(
      orderedColumnIds.map((columnId, index) =>
        prisma.column.update({
          where: { id: columnId },
          data: { order: (index + 1) * ORDER_GAP },
        })
      )
    );

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("reorderColumns failed:", error);
    return { success: false, error: "Failed to reorder columns" };
  }
}
