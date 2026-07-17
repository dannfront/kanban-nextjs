import { redirect } from "next/navigation";
import { getBoards } from "@/features/boards/actions";
import { CreateFirstBoard } from "@/features/boards/components/CreateFirstBoard";

export default async function KanbanDashboardPage() {
  const result = await getBoards();
  const boards = result.success ? result.data : [];

  if (boards.length > 0) {
    // Redirect to the most recently created board (ordered by createdAt desc)
    redirect(`/kanban-dashboard/${boards[0].id}`);
  }

  return <CreateFirstBoard />;
}
