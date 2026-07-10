"use server";

import { revalidatePath } from "next/cache";
import { type Task, type Subtask } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ActionResult, validateInput } from "@/lib/actions/result";
import { computeInsertOrder } from "@/lib/actions/ordering";
import { softDeleteTask, softDeleteSubtask } from "@/lib/actions/soft-delete";
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
const ORDER_GAP = 1000;

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

    const task = await prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findUnique({
        where: { id: taskId, deletedAt: null },
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
            await tx.subtask.update({
              where: { id: subtask.id },
              data: { title: subtask.title },
            });
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

    revalidatePath(REVALIDATE_PATH, "layout");
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
    await softDeleteTask(taskId);
    revalidatePath(REVALIDATE_PATH, "layout");
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
    const task = await prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findUnique({
        where: { id: taskId, deletedAt: null },
      });
      if (!existingTask) {
        throw new Error("Task not found");
      }

      const targetColumn = await tx.column.findUnique({
        where: { id: targetColumnId, deletedAt: null },
      });
      if (!targetColumn) {
        throw new Error("Target column not found");
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

      return tx.task.update({
        where: { id: taskId },
        data: { columnId: targetColumnId, order: newOrder },
      });
    });

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: task };
  } catch (error) {
    console.error("moveTask failed:", error);
    if (error instanceof Error) {
      if (error.message === "Task not found") {
        return { success: false, error: "Task not found" };
      }
      if (error.message === "Target column not found") {
        return { success: false, error: "Target column not found" };
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
    await prisma.$transaction(
      orderedTaskIds.map((taskId, index) =>
        prisma.task.update({
          where: { id: taskId },
          data: { order: (index + 1) * ORDER_GAP },
        })
      )
    );

    revalidatePath(REVALIDATE_PATH, "layout");
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

    const subtask = await prisma.subtask.create({
      data: { taskId, title },
    });

    revalidatePath(REVALIDATE_PATH, "layout");
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
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    });
    if (!subtask) {
      return { success: false, error: "Subtask not found" };
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { isCompleted: !subtask.isCompleted },
    });

    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: updatedSubtask };
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
    await softDeleteSubtask(subtaskId);
    revalidatePath(REVALIDATE_PATH, "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteSubtask failed:", error);
    return { success: false, error: "Failed to delete subtask" };
  }
}
