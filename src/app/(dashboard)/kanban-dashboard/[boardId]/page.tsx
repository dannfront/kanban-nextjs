import { getBoard, getColumnsForBoard } from "@/lib/boards";
import { getTasksForBoard } from "@/lib/tasks";
import { EmptyBoard } from "@/features/boards/components/EmptyBoard";
import { BoardView } from "@/features/boards/components/columns/BoardView";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { boardId } = await params;
  const board = getBoard(boardId);
  const [columns, tasks] = board
    ? await Promise.all([getColumnsForBoard(boardId), getTasksForBoard(boardId)])
    : [[], []];

  if (columns.length === 0) {
    return <EmptyBoard />;
  }

  return <BoardView initialColumns={columns} initialTasks={tasks} />;
}
