"use client";

import { useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ColumnFields } from "./ColumnFields";

const columnSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Can't be empty").max(255),
});

const baseBoardFormSchema = z.object({
  name: z.string().min(1, "Can't be empty").max(255),
  columns: z.array(columnSchema).min(1, "Add at least one column"),
});

export type BoardFormData = z.infer<typeof baseBoardFormSchema>;

const createBoardFormResolver = (excludeBoardId?: string) => {
  const schema = baseBoardFormSchema.superRefine((data, ctx) => {
    const boards = useBoardStore.getState().boards;
    const isDuplicate = boards.some(
      (b) =>
        b.id !== excludeBoardId &&
        b.name.trim().toLowerCase() === data.name.trim().toLowerCase()
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
};

interface BoardFormFieldsProps {
  mode: "create" | "edit";
  defaultValues?: { name: string; columns: { id?: string; name: string }[] };
  excludeBoardId?: string;
  onRemoveColumn?: (columnId: string, columnName: string) => void;
  onSubmit: (data: BoardFormData) => void;
}

export function BoardFormFields({
  mode,
  defaultValues,
  excludeBoardId,
  onRemoveColumn,
  onSubmit,
}: BoardFormFieldsProps) {
  const nameLabel = mode === "create" ? "Name" : "Board Name";
  const columnsLabel = mode === "create" ? "Columns" : "Board Columns";

  const formDefaults = useMemo(() => {
    if (mode === "edit") {
      return {
        name: defaultValues?.name ?? "",
        columns: defaultValues?.columns ?? [],
      };
    }

    return {
      name: "",
      columns: [{ name: "Todo" }, { name: "Doing" }],
    };
  }, [defaultValues, mode]);

  const resolver = useMemo(
    () => createBoardFormResolver(excludeBoardId),
    [excludeBoardId]
  );

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
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
      />

      <Button type="submit" variant="primary" size="lg" className="w-full">
        {mode === "create" ? "Create New Board" : "Save Changes"}
      </Button>
    </form>
  );
}
