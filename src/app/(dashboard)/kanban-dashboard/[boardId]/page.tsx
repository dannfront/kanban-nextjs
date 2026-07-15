import { notFound } from "next/navigation";
import { EmptyBoard } from "@/features/boards/components/EmptyBoard";
import { BoardView } from "@/features/boards/components/columns/BoardView";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { boardKeys } from "@/features/boards/hooks/query-keys";
import {
  boardDetailQueryOptions,
  boardTasksQueryOptions,
} from "@/features/boards/hooks/query-options";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { boardId } = await params;

  // SSR prefetch board detail + tasks into TanStack Query cache
  const queryClient = getQueryClient();
  try {
    await Promise.all([
      queryClient.fetchQuery(boardDetailQueryOptions(boardId)),
      queryClient.fetchQuery(boardTasksQueryOptions(boardId)),
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
      <BoardView boardId={boardId} />
    </HydrationBoundary>
  );
}
