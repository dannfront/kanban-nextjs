export interface SortableTaskResult {
  ref: (element: Element | null) => void;
  isDragging: boolean;
  handleRef: (element: Element | null) => void;
  isDropTarget: boolean;
}

export interface DroppableColumnResult {
  ref: (element: Element | null) => void;
  isDropTarget: boolean;
}

export interface DragStateResult {
  isDragging: boolean;
}
