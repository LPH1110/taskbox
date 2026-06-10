import type { Board, BoardMember } from ".";

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
  assigneeIds: string[];
  due_date?: string | null;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  category: string;
  taskIds: string[];
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author: { id: string; full_name: string; avatar_url: string | null; email: string };
}

export interface Attachment {
  id: string;
  task_id: string;
  uploader_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploader: { id: string; full_name: string; avatar_url: string | null; email: string };
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_completed: boolean;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
}

export interface Checklist {
  id: string;
  task_id: string;
  title: string;
  created_at: string;
  items: ChecklistItem[];
}

export interface BoardDetailState {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  labels: Record<string, Label>;
  members: BoardMember[];
  comments: Record<string, Comment[]>;
  attachments: Record<string, Attachment[]>;
  checklists: Record<string, Checklist[]>;
  columnOrder: string[];
  isLoading: boolean;
  selectedTaskId: string | null;
  currentBoard: Board | null;
}
