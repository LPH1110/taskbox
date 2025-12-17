import type { Board } from ".";

export interface Task {
  id: string;
  content: string;
  description?: string;
  column_id: string;
  priority?: "low" | "medium" | "high";
  position: number;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  taskIds: string[];
}

export interface BoardDetailState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
  isLoading: boolean;
  selectedTaskId: string | null;
  currentBoard: Board | null;
}
