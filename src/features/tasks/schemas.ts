import { z } from "zod";

export const CreateTaskSchema = z.object({
  columnId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
      })
    )
    .optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  columnId: z.string().uuid().optional(),
  subtasks: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        isActive: z.boolean().optional(),
      })
    )
    .optional(),
});

export const TaskIdSchema = z.object({
  taskId: z.string().uuid(),
});

export const MoveTaskSchema = z.object({
  taskId: z.string().uuid(),
  targetColumnId: z.string().uuid(),
  newIndex: z.number().int().min(0),
});

export const ReorderTasksSchema = z.object({
  columnId: z.string().uuid(),
  orderedTaskIds: z.array(z.string().uuid()),
});

export const CreateSubtaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().min(1),
});

export const SubtaskIdSchema = z.object({
  subtaskId: z.string().uuid(),
});
