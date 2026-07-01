import "server-only";

import data from "../../data.json";
import type { Board, Column } from "@/features/boards/types";

export function getBoards(): Board[] {
  return data.boards;
}

export function getBoard(id: string): Board | undefined {
  return data.boards.find((board) => board.id === id);
}

export function getColumnsForBoard(boardId: string): Column[] {
  return data.columns.filter((column) => column.boardId === boardId);
}
