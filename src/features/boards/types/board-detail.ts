import type { Board } from ".";

export interface Label {
  id: string;
  board_id: string;
  title: string;
  color: string;
}

export interface Task {
  id: string;
  content: string;
  description?: string;
  column_id: string;
  priority?: "low" | "medium" | "high";
  position: number;
  labelIds: string[];
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
  labels: Record<string, Label>;
  columnOrder: string[];
  isLoading: boolean;
  selectedTaskId: string | null;
  currentBoard: Board | null;
}
