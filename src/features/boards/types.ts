export interface Board {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  color: string;
  order: number;
}
