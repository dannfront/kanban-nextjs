"use client";

import { useId, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useBoard } from "@/features/boards/hooks/use-board";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Task } from "@/features/tasks/types";
import iconCross from "@/assets/icon-cross.svg";

const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Can't be empty").max(255),
  isCompleted: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
});

const taskFormSchema = z.object({
  title: z.string().min(1, "Can't be empty").max(255),
  description: z.string().max(1000).optional().default(""),
  subtasks: z.array(subtaskSchema).default([]),
  columnId: z.string().uuid("Invalid column"),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

const resolver = zodResolver(taskFormSchema) as Resolver<TaskFormData>;

interface TaskFormProps {
  boardId: string;
  defaultValues?: Partial<Task>;
  mode: "create" | "edit";
  onSubmit: (data: TaskFormData) => void;
}

export function TaskForm({
  boardId,
  defaultValues,
  mode,
  onSubmit,
}: TaskFormProps) {
  const { data: boardData } = useBoard(boardId);
  const columns =
    boardData?.columns
      .filter((column) => column.boardId === boardId)
      .sort((a, b) => a.order - b.order) ?? [];

  const statusOptions = useMemo(
    () =>
      columns.map((column) => ({
        value: column.id,
        label: column.name,
      })),
    [columns],
  );

  const firstColumnId = columns[0]?.id ?? "";

  const formDefaults = useMemo(() => {
    const defaultSubtasks =
      mode === "create"
        ? [
            { title: "", isCompleted: false },
            { title: "", isCompleted: false },
          ]
        : defaultValues?.subtasks ?? [];

    return {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      columnId: defaultValues?.columnId ?? firstColumnId,
      subtasks: defaultSubtasks,
    };
  }, [defaultValues, firstColumnId, mode]);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver,
    defaultValues: formDefaults,
  });

  const { fields, append, remove, update } = useFieldArray<
    TaskFormData,
    "subtasks",
    "keyId"
  >({
    control,
    name: "subtasks",
    keyName: "keyId",
  });

  const statusId = useId();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Title"
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Description"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="space-y-3">
        <p className="text-xs font-bold text-[var(--color-text-secondary)]">
          Subtasks
        </p>
        {fields.map(
          (field, index) =>
            !field.isDeleted && (
              <div key={field.keyId} className="flex items-center gap-4">
                <input type="hidden" {...register(`subtasks.${index}.id`)} />
                <input type="hidden" {...register(`subtasks.${index}.isDeleted`)} />
                <Controller
                  name={`subtasks.${index}.title`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <Input
                      className="flex-1"
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (field.id) {
                      update(index, {
                        ...getValues(`subtasks.${index}`),
                        isDeleted: true,
                      });
                    } else {
                      remove(index);
                    }
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--color-medium-gray)] transition-colors hover:text-[var(--color-red)]"
                  aria-label="Remove subtask"
                >
                  <Image src={iconCross} alt="" width={15} height={15} />
                </button>
              </div>
            ),
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => append({ title: "", isCompleted: false, isDeleted: false })}
        >
          + Add New Subtask
        </Button>
      </div>

      <Controller
        name="columnId"
        control={control}
        render={({ field }) => (
          <Select
            id={statusId}
            label="Status"
            value={field.value}
            onChange={field.onChange}
            options={statusOptions}
          />
        )}
      />

      <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}>
        {mode === "create" ? "Create Task" : "Save Changes"}
      </Button>
    </form>
  );
}
