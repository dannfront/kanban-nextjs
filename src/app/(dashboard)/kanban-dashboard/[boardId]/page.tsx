import { notFound } from "next/navigation";
import { getBoardWithColumns } from "@/features/boards/actions";
import { getTasksWithSubtasks } from "@/features/tasks/actions";
import { EmptyBoard } from "@/features/boards/components/EmptyBoard";
import { BoardView } from "@/features/boards/components/columns/BoardView";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { boardKeys } from "@/features/boards/hooks/query-keys";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { boardId } = await params;

  // SSR prefetch board detail + tasks into TanStack Query cache
  const queryClient = getQueryClient();
  try {
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: boardKeys.detail(boardId),
        queryFn: async () => {
          const result = await getBoardWithColumns(boardId);
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
      }),
      queryClient.fetchQuery({
        queryKey: boardKeys.tasks(boardId),
        queryFn: async () => {
          const result = await getTasksWithSubtasks(boardId);
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
      }),
    ]);
  } catch {
    notFound();
  }

  // Check if board has columns from the prefetched query cache
  const boardData = queryClient.getQueryData(boardKeys.detail(boardId)) as
    | { columns: unknown[] }
    | undefined;
  if (!boardData?.columns?.length) {
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EmptyBoard />
      </HydrationBoundary>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardView />
    </HydrationBoundary>
  );
}
