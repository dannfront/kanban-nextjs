import { getBoards } from "@/lib/boards";
import { DashboardShell } from "@/components/layout/DashboardShell";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}

export default async function BoardLayout({
  children,
  params,
}: LayoutProps) {
  await params;
  const boards = getBoards();

  return (
    <DashboardShell boards={boards}>
      {children}
    </DashboardShell>
  );
}
