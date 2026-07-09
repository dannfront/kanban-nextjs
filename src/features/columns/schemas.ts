import { z } from "zod";

export const CreateColumnSchema = z.object({
  boardId: z.string().uuid(),
  name: z.string().min(1),
  color: z.string(),
  order: z.number().optional(),
});

export const UpdateColumnSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional(),
  order: z.number().optional(),
});

export const ColumnIdSchema = z.object({
  columnId: z.string().uuid(),
});

export const ReorderColumnsSchema = z.object({
  boardId: z.string().uuid(),
  orderedColumnIds: z.array(z.string().uuid()),
});
