"use server";
import "server-only";

import { type Task, type Subtask } from "@prisma/client";
import type { TaskWithSubtasks } from "./types";
import { prisma } from "@/lib/prisma";
import { ActionResult, validateInput } from "@/lib/actions/result";
import { defineAction } from "@/lib/actions/define-action";
import {
  GAP,
  computeNextOrder,
  computeMoveOrder,
  buildReorderUpdates,
} from "@/lib/actions/ordering";
import { upsertSubtasks } from "@/lib/actions/upsert";
import { softDeleteTask, softDeleteSubtask } from "@/lib/actions/soft-delete";
import {
  requireBoardOwnership,
  findBoardIdForColumn,
  findBoardIdForTask,
  findBoardIdForSubtask,
} from "@/lib/auth";
import { BoardIdSchema } from "@/features/boards/schemas";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskIdSchema,
  MoveTaskSchema,
  ReorderTasksSchema,
  CreateSubtaskSchema,
  SubtaskIdSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Simple actions
// ---------------------------------------------------------------------------

export const createTask = defineAction({
  validate: (input: unknown) => validateInput(CreateTaskSchema, input),
  handler: async ({ columnId, title, description, subtasks }) => {
    const columnBoardId = await findBoardIdForColumn(columnId);
    if (!columnBoardId) {
      return { success: false, error: "Column not found" };
    }
    await requireBoardOwnership(columnBoardId);

    const task = await prisma.$transaction(async (tx) => {
      const lastTask = await tx.task.findFirst({
        where: { columnId, deletedAt: null },
        orderBy: { order: "desc" },
      });
      const order = computeNextOrder(lastTask?.order ?? null);

      const newTask = await tx.task.create({
        data: { columnId, title, description, order },
      });

      if (subtasks && subtasks.length > 0) {
        await tx.subtask.createMany({
          data: subtasks.map((subtask) => ({
            taskId: newTask.id,
            title: subtask.title,
          })),
        });
      }

      return tx.task.findUnique({
        where: { id: newTask.id },
        include: { subtasks: { where: { deletedAt: null } } },
      });
    });

    if (!task) {
      return { success: false, error: "Failed to create task" };
    }

    return { success: true, data: task };
  },
  errorLabel: "Failed to create task",
});

export const deleteTask = defineAction({
  validate: (taskId: unknown) => validateInput(TaskIdSchema, { taskId }),
  handler: async ({ taskId }) => {
    const boardId = await findBoardIdForTask(taskId);
    if (!boardId) {
      return { success: false, error: "Task not found" };
    }
    await requireBoardOwnership(boardId);
    await softDeleteTask(taskId);
    return { success: true, data: undefined };
  },
  errorLabel: "Failed to delete task",
});

export const createSubtask = defineAction({
  validate: (input: unknown) => validateInput(CreateSubtaskSchema, input),
  handler: async ({ taskId, title }) => {
    const boardId = await findBoardIdForTask(taskId);
    if (!boardId) {
      return { success: false, error: "Parent task not found" };
    }
    await requireBoardOwnership(boardId);

    const subtask = await prisma.subtask.create({
      data: { taskId, title },
    });

    return { success: true, data: subtask };
  },
  errorLabel: "Failed to create subtask",
});

export const toggleSubtask = defineAction({
  validate: (subtaskId: unknown) => validateInput(SubtaskIdSchema, { subtaskId }),
  handler: async ({ subtaskId }) => {
    const boardId = await findBoardIdForSubtask(subtaskId);
    if (!boardId) {
      return { success: false, error: "Subtask not found" };
    }
    await requireBoardOwnership(boardId);

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId, deletedAt: null },
    });
    if (!subtask) {
      return { success: false, error: "Subtask not found" };
    }

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { isCompleted: !subtask.isCompleted },
    });

    return { success: true, data: updated };
  },
  errorLabel: "Failed to toggle subtask",
});

export const deleteSubtask = defineAction({
  validate: (subtaskId: unknown) => validateInput(SubtaskIdSchema, { subtaskId }),
  handler: async ({ subtaskId }) => {
    const boardId = await findBoardIdForSubtask(subtaskId);
    if (!boardId) {
      return { success: false, error: "Subtask not found" };
    }
    await requireBoardOwnership(boardId);
    await softDeleteSubtask(subtaskId);
    return { success: true, data: undefined };
  },
  errorLabel: "Failed to delete subtask",
});

export const reorderTasksInColumn = defineAction({
  validate: (columnId: unknown, orderedTaskIds: unknown) =>
    validateInput(ReorderTasksSchema, { columnId, orderedTaskIds }),
  handler: async ({ columnId, orderedTaskIds }) => {
    const boardId = await findBoardIdForColumn(columnId);
    if (!boardId) {
      return { success: false, error: "Column not found" };
    }
    await requireBoardOwnership(boardId);

    const matching = await prisma.task.count({
      where: { id: { in: orderedTaskIds }, columnId, deletedAt: null },
    });
    if (matching !== orderedTaskIds.length) {
      return { success: false, error: "Some tasks do not belong to this column" };
    }

    const updates = buildReorderUpdates(orderedTaskIds);
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.task.update({ where: { id }, data: { order } })
      )
    );

    return { success: true, data: undefined };
  },
  errorLabel: "Failed to reorder tasks",
});

// ---------------------------------------------------------------------------
// Complex actions
// ---------------------------------------------------------------------------

export const moveTask = defineAction({
  validate: (taskId: unknown, targetColumnId: unknown, newIndex: unknown) =>
    validateInput(MoveTaskSchema, { taskId, targetColumnId, newIndex }),
  handler: async ({ taskId, targetColumnId, newIndex }) => {
    const sourceBoardId = await findBoardIdForTask(taskId);
    if (!sourceBoardId) {
      return { success: false, error: "Task not found" };
    }
    await requireBoardOwnership(sourceBoardId);

    const targetBoardId = await findBoardIdForColumn(targetColumnId);
    if (!targetBoardId) {
      return { success: false, error: "Target column not found" };
    }
    await requireBoardOwnership(targetBoardId);

    try {
      const task = await prisma.$transaction(async (tx) => {
        const existingTask = await tx.task.findFirst({
          where: { id: taskId, deletedAt: null },
        });
        if (!existingTask) {
          throw new Error("Task not found");
        }

        const tasks = await tx.task.findMany({
          where: {
            columnId: targetColumnId,
            deletedAt: null,
            id: { not: taskId },
          },
          orderBy: { order: "asc" },
        });

        const { order, needsRebalance } = computeMoveOrder(
          tasks.map((t) => ({ order: t.order })),
          newIndex
        );

        if (needsRebalance) {
          const allTasks = await tx.task.findMany({
            where: { columnId: targetColumnId, deletedAt: null },
            orderBy: { order: "asc" },
          });
          for (const [i, t] of allTasks.entries()) {
            if (t.id !== taskId) {
              await tx.task.update({
                where: { id: t.id },
                data: { order: (i + 1) * GAP },
              });
            }
          }
          const rebalanced = await tx.task.findMany({
            where: {
              columnId: targetColumnId,
              deletedAt: null,
              id: { not: taskId },
            },
            orderBy: { order: "asc" },
          });
          const recomputed = computeMoveOrder(
            rebalanced.map((t) => ({ order: t.order })),
            newIndex
          );
          return tx.task.update({
            where: { id: taskId },
            data: { columnId: targetColumnId, order: recomputed.order },
          });
        }

        return tx.task.update({
          where: { id: taskId },
          data: { columnId: targetColumnId, order },
        });
      });

      return { success: true, data: task };
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        return { success: false, error: "Task not found" };
      }
      throw error;
    }
  },
  errorLabel: "Failed to move task",
});

export const updateTask = defineAction({
  validate: (taskId: unknown, input: unknown) => {
    const idResult = validateInput(TaskIdSchema, { taskId });
    if (!idResult.ok) return idResult;
    const inputResult = validateInput(UpdateTaskSchema, input);
    if (!inputResult.ok) return inputResult;
    return { ok: true, data: { taskId: idResult.data.taskId, ...inputResult.data } };
  },
  handler: async ({ taskId, title, description, columnId, subtasks }) => {
    const taskBoardId = await findBoardIdForTask(taskId);
    if (!taskBoardId) {
      return { success: false, error: "Task not found" };
    }
    await requireBoardOwnership(taskBoardId);

    if (columnId !== undefined) {
      const targetBoardId = await findBoardIdForColumn(columnId);
      if (!targetBoardId) {
        return { success: false, error: "Target column not found" };
      }
      await requireBoardOwnership(targetBoardId);
    }

    try {
      const task = await prisma.$transaction(async (tx) => {
        const existingTask = await tx.task.findUnique({
          where: { id: taskId, deletedAt: null },
          select: { columnId: true },
        });
        if (!existingTask) {
          throw new Error("Task not found");
        }

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        if (columnId !== undefined && columnId !== existingTask.columnId) {
          const lastTask = await tx.task.findFirst({
            where: { columnId, deletedAt: null },
            orderBy: { order: "desc" },
          });
          updateData.columnId = columnId;
          updateData.order = computeNextOrder(lastTask?.order ?? null);
        }

        await tx.task.update({
          where: { id: taskId },
          data: updateData,
        });

        if (subtasks && subtasks.length > 0) {
          await upsertSubtasks(tx, taskId, subtasks);
        }

        return tx.task.findUnique({
          where: { id: taskId },
          include: { subtasks: { where: { deletedAt: null } } },
        });
      });

      if (!task) {
        return { success: false, error: "Task not found" };
      }

      return { success: true, data: task };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "Task not found" || error.message === "Subtask not found")
      ) {
        return { success: false, error: error.message };
      }
      throw error;
    }
  },
  errorLabel: "Failed to update task",
});

// ---------------------------------------------------------------------------
// Query — UNTOUCHED
// ---------------------------------------------------------------------------

export async function getTasksWithSubtasks(
  boardId: string
): Promise<ActionResult<TaskWithSubtasks[]>> {
  const validation = validateInput(BoardIdSchema, { boardId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    await requireBoardOwnership(boardId);

    const tasks = await prisma.task.findMany({
      where: {
        column: { boardId, deletedAt: null },
        deletedAt: null,
      },
      include: {
        subtasks: { where: { deletedAt: null } },
      },
      orderBy: { order: "asc" },
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error("getTasksWithSubtasks failed:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}
