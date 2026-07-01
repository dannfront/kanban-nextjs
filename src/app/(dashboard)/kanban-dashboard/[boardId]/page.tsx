import { getBoard, getColumnsForBoard } from "@/lib/boards";
import { EmptyBoard } from "@/features/boards/components/EmptyBoard";

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

  return (
    <div className="flex h-full items-center justify-center text-[var(--color-medium-gray)]">
      Board content coming soon
    </div>
  );
}
