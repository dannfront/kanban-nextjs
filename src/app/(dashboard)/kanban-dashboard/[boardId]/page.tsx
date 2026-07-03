import { getBoard, getColumnsForBoard } from "@/lib/boards";
import { EmptyBoard } from "@/features/boards/components/EmptyBoard";
import { BoardView } from "@/features/boards/components/columns/BoardView";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { boardId } = await params;
  const board = getBoard(boardId);
  const columns = board ? getColumnsForBoard(boardId) : [];

  if (columns.length === 0) {
    return <EmptyBoard />;
  }

  return <BoardView initialColumns={columns} />;
}
