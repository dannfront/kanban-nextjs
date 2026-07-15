import { z } from "zod";

export const CreateBoardSchema = z.object({
  name: z.string().min(1),
  columns: z.array(
    z.object({
      name: z.string().min(1),
      color: z.string(),
    })
  ),
});

export const UpdateBoardSchema = z.object({
  name: z.string().min(1).optional(),
  columns: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        color: z.string().optional(),
      })
    )
    .optional(),
});

export const BoardIdSchema = z.object({
  boardId: z.string().uuid(),
});
