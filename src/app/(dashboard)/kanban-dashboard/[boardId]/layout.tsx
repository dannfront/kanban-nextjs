import { DashboardShell } from "@/components/layout/DashboardShell";
import { getQueryClient } from "@/lib/query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { boardsQueryOptions } from "@/features/boards/hooks/query-options";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}

export default async function BoardLayout({
  children,
  params,
}: LayoutProps) {
  await params;

  // SSR prefetch boards into TanStack Query cache
  const queryClient = getQueryClient();
  try {
    await queryClient.fetchQuery(boardsQueryOptions());
  } catch {
    // Prefetch failed — skip without crashing so the page still renders
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell>
        {children}
      </DashboardShell>
    </HydrationBoundary>
  );
}
