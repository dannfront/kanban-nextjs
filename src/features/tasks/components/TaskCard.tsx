import type { Task } from "@/features/tasks/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const completed = task.subtasks.filter((s) => s.isCompleted).length;
  const total = task.subtasks.length;

  return (
    <div className="w-full rounded-lg bg-[var(--color-bg-card)] px-4 py-[23px] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
      <h3 className="text-[15px] font-bold leading-[19px] text-[var(--color-text-primary)] line-clamp-2">
        {task.title}
      </h3>
      <p className="mt-2 text-[12px] font-bold text-[var(--color-text-secondary)]">
        {completed} of {total} subtasks
      </p>
    </div>
  );
}
