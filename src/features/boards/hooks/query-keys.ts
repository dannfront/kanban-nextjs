export const boardKeys = {
  all: ["boards"] as const,
  detail: (id: string) => [...boardKeys.all, id] as const,
  tasks: (boardId: string) => [...boardKeys.detail(boardId), "tasks"] as const,
};
