import "server-only";
import type { z } from "zod";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function validateInput<T>(schema: z.ZodType<T>, input: unknown):
  | { ok: true; data: T }
  | { ok: false; error: string } {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const firstIssue = parsed.error.issues[0];
  const path = firstIssue.path.join(".") || "input";

  return { ok: false, error: `${path}: ${firstIssue.message}` };
}
