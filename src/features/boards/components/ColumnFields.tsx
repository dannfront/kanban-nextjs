"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useFormState } from "react-hook-form";
import type { Control, UseFormGetValues } from "react-hook-form";
import Image from "next/image";
import { useBoardStore } from "@/features/boards/store/useBoardStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import iconCross from "@/assets/icon-cross.svg";
import type { BoardFormData } from "./BoardFormFields";

interface ColumnFieldsProps {
  control: Control<BoardFormData>;
  getValues: UseFormGetValues<BoardFormData>;
  onRemoveColumn?: (columnId: string, columnName: string) => void;
  label?: string;
}

export function ColumnFields({
  control,
  getValues,
  onRemoveColumn,
  label = "Columns",
}: ColumnFieldsProps) {
  const allColumns = useBoardStore((state) => state.columns);

  const { fields, append, remove } = useFieldArray<
    BoardFormData,
    "columns",
    "keyId"
  >({
    control,
    name: "columns",
    keyName: "keyId",
  });

  const { errors } = useFormState({ control });

  useEffect(() => {
    const currentColumns = getValues("columns");
    const columnIds = new Set(allColumns.map((column) => column.id));
    const removedIndices = currentColumns
      .map((column, index) => ({ column, index }))
      .filter(({ column }) => column.id && !columnIds.has(column.id))
      .map(({ index }) => index)
      .sort((a, b) => b - a);

    removedIndices.forEach((index) => remove(index));
  }, [allColumns, getValues, remove]);

  const handleRemoveColumn = (index: number, columnId?: string) => {
    if (columnId && onRemoveColumn) {
      const columnName = getValues(`columns.${index}.name`);
      onRemoveColumn(columnId, columnName);
      return;
    }

    remove(index);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-[var(--color-text-secondary)]">
        {label}
      </p>

      {fields.map((field, index) => (
        <div key={field.keyId} className="flex items-center gap-4">
          <Controller
            name={`columns.${index}.id`}
            control={control}
            render={({ field: hiddenField }) => (
              <input type="hidden" {...hiddenField} value={hiddenField.value ?? ""} />
            )}
          />
          <Controller
            name={`columns.${index}.name`}
            control={control}
            render={({ field: inputField, fieldState }) => (
              <Input
                className="flex-1"
                placeholder="Column name"
                error={fieldState.error?.message}
                {...inputField}
              />
            )}
          />
          <button
            type="button"
            onClick={() => handleRemoveColumn(index, field.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--color-medium-gray)] transition-colors hover:text-[var(--color-red)]"
            aria-label="Remove column"
          >
            <Image src={iconCross} alt="" width={15} height={15} />
          </button>
        </div>
      ))}

      {errors.columns?.root?.message ?? errors.columns?.message ? (
        <p className="text-[13px] font-medium text-[var(--color-red)]">
          {errors.columns?.root?.message ?? errors.columns?.message}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => append({ name: "" })}
      >
        + Add New Column
      </Button>
    </div>
  );
}
