"use server";

import { revalidatePath } from "next/cache";
import { type Task, type Subtask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResult, validateInput } from "@/lib/actions/result";
import { computeInsertOrder, GAP, isOrderCollision } from "@/lib/actions/ordering";
import { softDeleteTask, softDeleteSubtask } from "@/lib/actions/soft-delete";
import {
  requireBoardOwnership,
  findBoardIdForColumn,
  findBoardIdForTask,
  findBoardIdForSubtask,
} from "@/lib/auth";
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskIdSchema,
  MoveTaskSchema,
  ReorderTasksSchema,
  CreateSubtaskSchema,
  SubtaskIdSchema,
} from "./schemas";

const REVALIDATE_PATH = "/kanban-dashboard";
const ORDER_GAP = GAP;

type TaskWithSubtasks = Task & { subtasks: Subtask[] };

export async function createTask(
  input: unknown
): Promise<ActionResult<TaskWithSubtasks>> {
  const validation = validateInput(CreateTaskSchema, input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const { columnId, title, description, subtasks } = validation.data;

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
      const order = lastTask ? lastTask.order + ORDER_GAP : ORDER_GAP;

      const newTask = await tx.task.create({
        data: {
          columnId,
          title,
          description,
          order,
        },
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

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: task };
  } catch (error) {
    console.error("createTask failed:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTask(
  taskId: string,
  input: unknown
): Promise<ActionResult<TaskWithSubtasks>> {
  const idValidation = validateInput(TaskIdSchema, { taskId });
  if (!idValidation.ok) {
    return { success: false, error: idValidation.error };
  }

  const inputValidation = validateInput(UpdateTaskSchema, input);
  if (!inputValidation.ok) {
    return { success: false, error: inputValidation.error };
  }

  try {
    const { title, description, columnId, subtasks } = inputValidation.data;

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

    const task = await prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findUnique({
        where: { id: taskId, deletedAt: null },
        select: { columnId: true },
      });
      if (!existingTask) {
        throw new Error("Task not found");
      }

      const updateData: Partial<{
        title: string;
        description: string;
        columnId: string;
        order: number;
      }> = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      if (columnId !== undefined && columnId !== existingTask.columnId) {
        const lastTask = await tx.task.findFirst({
          where: { columnId, deletedAt: null },
          orderBy: { order: "desc" },
        });
        updateData.columnId = columnId;
        updateData.order = lastTask ? lastTask.order + ORDER_GAP : ORDER_GAP;
      }

      await tx.task.update({
        where: { id: taskId },
        data: updateData,
      });

      if (subtasks && subtasks.length > 0) {
        for (const subtask of subtasks) {
          if (subtask.id) {
            const updated = await tx.subtask.updateMany({
              where: { id: subtask.id, taskId },
              data: { title: subtask.title },
            });
            if (updated.count === 0) {
              throw new Error("Subtask not found");
            }
          } else {
            await tx.subtask.create({
              data: {
                taskId,
                title: subtask.title,
              },
            });
          }
        }
      }

      return tx.task.findUnique({
        where: { id: taskId },
        include: { subtasks: { where: { deletedAt: null } } },
      });
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: task };
  } catch (error) {
    console.error("updateTask failed:", error);
    if (error instanceof Error && error.message === "Task not found") {
      return { success: false, error: "Task not found" };
    }
    return { success: false, error: "Failed to update task" };
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult<void>> {
  const validation = validateInput(TaskIdSchema, { taskId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const boardId = await findBoardIdForTask(taskId);
    if (!boardId) {
      return { success: false, error: "Task not found" };
    }
    await requireBoardOwnership(boardId);
    await softDeleteTask(taskId);
    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteTask failed:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

export async function moveTask(
  taskId: string,
  targetColumnId: string,
  newIndex: number
): Promise<ActionResult<Task>> {
  const validation = validateInput(MoveTaskSchema, {
    taskId,
    targetColumnId,
    newIndex,
  });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
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

      let newOrder: number;
      if (tasks.length === 0) {
        newOrder = ORDER_GAP;
      } else if (newIndex === 0) {
        newOrder = computeInsertOrder(null, tasks[0].order);
      } else if (newIndex >= tasks.length) {
        newOrder = computeInsertOrder(tasks[tasks.length - 1].order, null);
      } else {
        newOrder = computeInsertOrder(
          tasks[newIndex - 1].order,
          tasks[newIndex].order
        );
      }

      if (isOrderCollision(
        newIndex === 0 ? null : tasks[newIndex - 1]?.order ?? null,
        newIndex >= tasks.length ? null : tasks[newIndex]?.order ?? null,
        newOrder
      )) {
        const allTasks = await tx.task.findMany({
          where: { columnId: targetColumnId, deletedAt: null },
          orderBy: { order: "asc" },
        });
        for (const [i, t] of allTasks.entries()) {
          if (t.id !== taskId) {
            await tx.task.update({
              where: { id: t.id },
              data: { order: (i + 1) * ORDER_GAP },
            });
          }
        }
        const rebalanced = await tx.task.findMany({
          where: { columnId: targetColumnId, deletedAt: null, id: { not: taskId } },
          orderBy: { order: "asc" },
        });
        if (rebalanced.length === 0) {
          newOrder = ORDER_GAP;
        } else if (newIndex === 0) {
          newOrder = computeInsertOrder(null, rebalanced[0].order);
        } else if (newIndex >= rebalanced.length) {
          newOrder = computeInsertOrder(rebalanced[rebalanced.length - 1].order, null);
        } else {
          newOrder = computeInsertOrder(
            rebalanced[newIndex - 1].order,
            rebalanced[newIndex].order
          );
        }
      }

      return tx.task.update({
        where: { id: taskId },
        data: { columnId: targetColumnId, order: newOrder },
      });
    });

    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: task };
  } catch (error) {
    console.error("moveTask failed:", error);
    if (error instanceof Error) {
      if (error.message === "Task not found") {
        return { success: false, error: "Task not found" };
      }
    }
    return { success: false, error: "Failed to move task" };
  }
}

export async function reorderTasksInColumn(
  columnId: string,
  orderedTaskIds: string[]
): Promise<ActionResult<void>> {
  const validation = validateInput(ReorderTasksSchema, {
    columnId,
    orderedTaskIds,
  });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
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

    await prisma.$transaction(
      orderedTaskIds.map((taskId, index) =>
        prisma.task.update({
          where: { id: taskId },
          data: { order: (index + 1) * ORDER_GAP },
        })
      )
    );

    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("reorderTasksInColumn failed:", error);
    return { success: false, error: "Failed to reorder tasks" };
  }
}

export async function createSubtask(
  input: unknown
): Promise<ActionResult<Subtask>> {
  const validation = validateInput(CreateSubtaskSchema, input);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const { taskId, title } = validation.data;

    const boardId = await findBoardIdForTask(taskId);
    if (!boardId) {
      return { success: false, error: "Parent task not found" };
    }
    await requireBoardOwnership(boardId);

    const subtask = await prisma.subtask.create({
      data: { taskId, title },
    });

    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: subtask };
  } catch (error) {
    console.error("createSubtask failed:", error);
    return { success: false, error: "Failed to create subtask" };
  }
}

export async function toggleSubtask(
  subtaskId: string
): Promise<ActionResult<Subtask>> {
  const validation = validateInput(SubtaskIdSchema, { subtaskId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const boardId = await findBoardIdForSubtask(subtaskId);
    if (!boardId) {
      return { success: false, error: "Subtask not found" };
    }
    await requireBoardOwnership(boardId);

    const result = await prisma.$queryRawUnsafe<Array<{
      id: string;
      taskId: string;
      title: string;
      isCompleted: boolean;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    }>>(
      `UPDATE "Subtask"
       SET "isCompleted" = NOT "isCompleted"
       WHERE id = $1 AND "deletedAt" IS NULL
       RETURNING *`,
      subtaskId
    );

    if (result.length === 0) {
      return { success: false, error: "Subtask not found" };
    }

    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("toggleSubtask failed:", error);
    return { success: false, error: "Failed to toggle subtask" };
  }
}

export async function deleteSubtask(
  subtaskId: string
): Promise<ActionResult<void>> {
  const validation = validateInput(SubtaskIdSchema, { subtaskId });
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  try {
    const boardId = await findBoardIdForSubtask(subtaskId);
    if (!boardId) {
      return { success: false, error: "Subtask not found" };
    }
    await requireBoardOwnership(boardId);
    await softDeleteSubtask(subtaskId);
    revalidatePath(REVALIDATE_PATH, "page");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteSubtask failed:", error);
    return { success: false, error: "Failed to delete subtask" };
  }
}
