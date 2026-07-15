import "server-only";
import { type ActionResult } from "@/lib/actions/result";

type ValidateResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

interface DefineActionConfig<TArgs extends unknown[], TInput, TOut> {
  validate: (...args: TArgs) => ValidateResult<TInput>;
  handler: (data: TInput) => Promise<ActionResult<TOut>>;
  errorLabel: string;
}

export function defineAction<TArgs extends unknown[], TInput, TOut>(
  config: DefineActionConfig<TArgs, TInput, TOut>
): (...args: TArgs) => Promise<ActionResult<TOut>> {
  return async (...args: TArgs): Promise<ActionResult<TOut>> => {
    const validation = config.validate(...args);
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }
    try {
      return await config.handler(validation.data);
    } catch (error) {
      console.error(`${config.errorLabel}:`, error);
      return { success: false, error: config.errorLabel };
    }
  };
}
