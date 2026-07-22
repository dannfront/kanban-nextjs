import { QueryClient } from "@tanstack/react-query";

const globalForQuery = globalThis as unknown as {
  queryClient?: QueryClient;
};

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 300_000,
        gcTime: 5 * 60_000,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  return (globalForQuery.queryClient ??= makeQueryClient());
}
