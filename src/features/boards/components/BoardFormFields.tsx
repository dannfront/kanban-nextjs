"use client";

import { useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "@/features/boards/hooks/query-keys";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useColor } from "@/lib/colors";
import { ColumnFields } from "./ColumnFields";

const columnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Can't be empty").max(255),
  color: z.string().optional(),
});

const baseBoardFormSchema = z.object({
  name: z.string().min(1, "Can't be empty").max(255),
  columns: z.array(columnSchema).min(1, "Add at least one column"),
});

export type BoardFormData = z.infer<typeof baseBoardFormSchema>;

function createBoardFormResolver(
  queryClient: ReturnType<typeof useQueryClient>,
  excludeBoardId?: string,
) {
  const schema = baseBoardFormSchema.superRefine((data, ctx) => {
    const boards = queryClient.getQueryData<{ id: string; name: string }[]>(
      boardKeys.all,
    );
    if (!boards) return;

    const isDuplicate = boards.some(
      (b) =>
        b.id !== excludeBoardId &&
        b.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
    );
    if (isDuplicate) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Already exists",
      });
    }
  });

  return zodResolver(schema) as Resolver<BoardFormData>;
}

interface BoardFormFieldsProps {
  mode: "create" | "edit";
  defaultValues?: {
    name: string;
    columns: { id?: string; name: string; color?: string }[];
  };
  excludeBoardId?: string;
  onRemoveColumn?: (columnId: string, columnName: string) => void;
  onSubmit: (data: BoardFormData) => void;
  allColumns?: { id: string }[];
}

export function BoardFormFields({
  mode,
  defaultValues,
  excludeBoardId,
  onRemoveColumn,
  onSubmit,
  allColumns,
}: BoardFormFieldsProps) {
  const queryClient = useQueryClient();
  const nameLabel = mode === "create" ? "Name" : "Board Name";
  const columnsLabel = mode === "create" ? "Columns" : "Board Columns";

  const colorRepo = useColor();

  const formDefaults = useMemo(() => {
    if (mode === "edit") {
      return {
        name: defaultValues?.name ?? "",
        columns: defaultValues?.columns ?? [],
      };
    }

    const defaults = colorRepo.generateMany(1);
    return {
      name: "",
      columns: [{ name: "Todo", color: defaults[0] }],
    };
  }, [defaultValues, mode, colorRepo]);

  const resolver = useMemo(
    () => createBoardFormResolver(queryClient, excludeBoardId),
    [queryClient, excludeBoardId],
  );

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BoardFormData>({
    resolver,
    defaultValues: formDefaults,
  });

  const nameId = useId();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        id={nameId}
        label={nameLabel}
        error={errors.name?.message}
        placeholder="e.g. Web Design"
        {...register("name")}
      />

      <ColumnFields
        control={control}
        getValues={getValues}
        onRemoveColumn={onRemoveColumn}
        label={columnsLabel}
        allColumns={allColumns}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {mode === "create" ? "Create New Board" : "Save Changes"}
      </Button>
    </form>
  );
}
