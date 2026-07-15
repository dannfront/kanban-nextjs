"use server";
import "server-only";

import { type Column } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateInput } from "@/lib/actions/result";
import { softDeleteColumn } from "@/lib/actions/soft-delete";
import { requireBoardOwnership, findBoardIdForColumn } from "@/lib/auth";
import { computeNextOrder, buildReorderUpdates } from "@/lib/actions/ordering";
import { defineAction } from "@/lib/actions/define-action";
import {
  CreateColumnSchema,
  UpdateColumnSchema,
  ColumnIdSchema,
  ReorderColumnsSchema,
} from "./schemas";

export const createColumn = defineAction({
  validate: (input: unknown) => validateInput(CreateColumnSchema, input),
  handler: async ({ boardId, name, color, order }) => {
    await requireBoardOwnership(boardId);

    let columnOrder = order;
    if (columnOrder === undefined) {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId, deletedAt: null },
        orderBy: { order: "desc" },
      });
      columnOrder = computeNextOrder(lastColumn?.order ?? null);
    }

    const column = await prisma.column.create({
      data: { boardId, name, color, order: columnOrder },
    });

    return { success: true, data: column };
  },
  errorLabel: "Failed to create column",
});

export const updateColumn = defineAction({
  validate: (columnId: unknown, input: unknown) => {
    const idResult = validateInput(ColumnIdSchema, { columnId });
    if (!idResult.ok) return idResult;
    const inputResult = validateInput(UpdateColumnSchema, input);
    if (!inputResult.ok) return inputResult;
    return { ok: true, data: { columnId: idResult.data.columnId, ...inputResult.data } };
  },
  handler: async ({ columnId, order: _ignored, ...safeData }) => {
    const boardId = await findBoardIdForColumn(columnId);
    if (!boardId) return { success: false, error: "Column not found" };
    await requireBoardOwnership(boardId);

    const column = await prisma.column.update({
      where: { id: columnId },
      data: safeData,
    });

    return { success: true, data: column };
  },
  errorLabel: "Failed to update column",
});

export const deleteColumn = defineAction({
  validate: (columnId: unknown) => validateInput(ColumnIdSchema, { columnId }),
  handler: async ({ columnId }) => {
    const boardId = await findBoardIdForColumn(columnId);
    if (!boardId) return { success: false, error: "Column not found" };
    await requireBoardOwnership(boardId);
    await softDeleteColumn(columnId);
    return { success: true, data: undefined };
  },
  errorLabel: "Failed to delete column",
});

export const reorderColumns = defineAction({
  validate: (boardId: unknown, orderedColumnIds: unknown) =>
    validateInput(ReorderColumnsSchema, { boardId, orderedColumnIds }),
  handler: async ({ boardId, orderedColumnIds }) => {
    await requireBoardOwnership(boardId);

    const matching = await prisma.column.count({
      where: { id: { in: orderedColumnIds }, boardId, deletedAt: null },
    });
    if (matching !== orderedColumnIds.length) {
      return { success: false, error: "Some columns do not belong to this board" };
    }

    const updates = buildReorderUpdates(orderedColumnIds);
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.column.update({ where: { id }, data: { order } })
      )
    );

    return { success: true, data: undefined };
  },
  errorLabel: "Failed to reorder columns",
});
