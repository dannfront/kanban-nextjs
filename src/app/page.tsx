import { redirect } from "next/navigation";
import { getBoards } from "@/features/boards/actions";

export default async function Home() {
  const result = await getBoards();
  const firstBoard = result.success ? result.data[0] : null;

  if (!firstBoard) {
    return <p className="p-8 text-sm text-[var(--color-text-secondary)]">No boards found. Run the seed script.</p>;
  }

  redirect(`/kanban-dashboard/${firstBoard.id}`);
}
