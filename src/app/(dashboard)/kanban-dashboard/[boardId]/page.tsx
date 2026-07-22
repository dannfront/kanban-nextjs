import { BoardPageContent } from "@/features/boards/components/BoardPageContent";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: PageProps) {
  const { boardId } = await params;

  return <BoardPageContent boardId={boardId} />;
}
