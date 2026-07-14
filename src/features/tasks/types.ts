export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  order: number;
  subtasks: Subtask[];
}
