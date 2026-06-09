/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  type PayloadAction
} from "@reduxjs/toolkit";
import { addExtraReducers } from "./reducers/extraReducers";
import type { Board, BoardMember } from "./types";
import {
  type Attachment,
  type BoardDetailState,
  type Checklist,
  type ChecklistItem,
  type Column,
  type Comment,
  type Label,
  type Task,
} from "./types/board-detail";

export * from "./thunks";

const initialState: BoardDetailState = {
  tasks: {},
  columns: {},
  labels: {},
  columnOrder: [],
  members: [],
  comments: {},
  attachments: {},
  checklists: {},
  isLoading: false,
  selectedTaskId: null,
  currentBoard: null,
};

const boardDetailSlice = createSlice({
  name: "boardDetail",
  initialState,
  reducers: {
    // 1. Board Metadata
    realtimeBoardUpdate: (state, action: PayloadAction<Partial<Board>>) => {
      if (state.currentBoard && state.currentBoard.id === action.payload.id) {
        state.currentBoard = { ...state.currentBoard, ...action.payload };
      }
    },

    // 2. Columns
    realtimeColumnUpsert: (state, action: PayloadAction<Column>) => {
      const col = action.payload;

      // 1. Kiểm tra xem column có thuộc board hiện tại không?
      // Quan trọng: Nếu column bị move sang board khác, ta phải xóa nó khỏi state hiện tại.
      if (col.board_id !== state.currentBoard?.id) {
        if (state.columns[col.id]) {
          delete state.columns[col.id];
          state.columnOrder = state.columnOrder.filter((id) => id !== col.id);
        }
        return;
      }

      // 2. Cập nhật Dictionary (Giữ lại taskIds hiện có nếu là UPDATE)
      const existingTaskIds = state.columns[col.id]?.taskIds || [];
      state.columns[col.id] = { ...col, taskIds: existingTaskIds };

      // 3. Cập nhật Order Array (IDEMPOTENT: Chỉ push nếu chưa có)
      if (!state.columnOrder.includes(col.id)) {
        state.columnOrder.push(col.id);
      }

      // 4. Sort lại dựa trên position từ Database để đảm bảo đồng bộ hoàn toàn
      state.columnOrder.sort(
        (a, b) =>
          (state.columns[a]?.position ?? 0) - (state.columns[b]?.position ?? 0)
      );
    },
    realtimeColumnDelete: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.columns[id];
      state.columnOrder = state.columnOrder.filter((colId) => colId !== id);
    },

    // 3. Tasks
    realtimeTaskUpsert: (state, action: PayloadAction<Task>) => {
      const task = action.payload;

      // Kiểm tra Task có thuộc về Column nào đang hiển thị không
      if (!state.columns[task.column_id]) return;

      const oldTask = state.tasks[task.id];
      // Bảo toàn labelIds cục bộ (vì payload realtime thường không có join task_labels)
      state.tasks[task.id] = {
        ...task,
        labelIds: oldTask?.labelIds || task.labelIds || [],
        assigneeIds: oldTask?.assigneeIds || task.assigneeIds || [],
      };

      // Xử lý logic di chuyển Column (nếu có)
      if (oldTask && oldTask.column_id !== task.column_id) {
        if (state.columns[oldTask.column_id]) {
          state.columns[oldTask.column_id].taskIds = state.columns[
            oldTask.column_id
          ].taskIds.filter((id) => id !== task.id);
        }
      }

      // Add ID vào column mới (Idempotent)
      const targetCol = state.columns[task.column_id];
      if (targetCol && !targetCol.taskIds.includes(task.id)) {
        targetCol.taskIds.push(task.id);
      }

      // Re-sort tasks trong column
      targetCol.taskIds.sort(
        (a, b) =>
          (state.tasks[a]?.position ?? 0) - (state.tasks[b]?.position ?? 0)
      );
    },

    realtimeTaskDelete: (
      state,
      action: PayloadAction<{ id: string; column_id: string }>
    ) => {
      const { id, column_id } = action.payload;
      delete state.tasks[id];
      if (state.columns[column_id]) {
        state.columns[column_id].taskIds = state.columns[
          column_id
        ].taskIds.filter((taskId) => taskId !== id);
      }
    },

    // 4. Labels (General)
    realtimeLabelUpsert: (state, action: PayloadAction<Label>) => {
      state.labels[action.payload.id] = action.payload;
    },
    realtimeLabelDelete: (state, action: PayloadAction<string>) => {
      const labelId = action.payload;
      delete state.labels[labelId];
      // Cleanup labelIds in all tasks
      Object.values(state.tasks).forEach((task) => {
        task.labelIds = task.labelIds.filter((id) => id !== labelId);
      });
    },

    // 5. Task Labels (Junction Table Updates)
    realtimeTaskLabelEvent: (
      state,
      action: PayloadAction<{
        task_id: string;
        label_id: string;
        type: "INSERT" | "DELETE";
      }>
    ) => {
      const { task_id, label_id, type } = action.payload;
      const task = state.tasks[task_id];
      if (task) {
        if (type === "INSERT" && !task.labelIds.includes(label_id)) {
          task.labelIds.push(label_id);
        } else if (type === "DELETE") {
          task.labelIds = task.labelIds.filter((id) => id !== label_id);
        }
      }
    },

    realtimeTaskAssigneeEvent: (
      state,
      action: PayloadAction<{
        task_id: string;
        user_id: string;
        type: "INSERT" | "DELETE";
      }>
    ) => {
      const { task_id, user_id, type } = action.payload;
      const task = state.tasks[task_id];
      if (task) {
        if (type === "INSERT" && !task.assigneeIds.includes(user_id)) {
          task.assigneeIds.push(user_id);
        } else if (type === "DELETE") {
          task.assigneeIds = task.assigneeIds.filter((id) => id !== user_id);
        }
      }
    },

    // 6. Members
    realtimeMemberEvent: (
      state,
      action: PayloadAction<{ member: BoardMember; type: "INSERT" | "DELETE" }>
    ) => {
      const { member, type } = action.payload;
      if (type === "INSERT") {
        if (!state.members.find((m) => m.user_id === member.user_id)) {
          state.members.push(member);
        }
      } else {
        state.members = state.members.filter(
          (m) => m.user_id !== member.user_id
        );
        // Clean up unassigned tasks automatically
        Object.values(state.tasks).forEach((task) => {
          if (task.assigneeIds) {
            task.assigneeIds = task.assigneeIds.filter((id) => id !== member.user_id);
          }
        });
      }
    },

    moveColumn: (
      state,
      action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const newColumnOrder = Array.from(state.columnOrder);
      const [removed] = newColumnOrder.splice(sourceIndex, 1);
      newColumnOrder.splice(destinationIndex, 0, removed);
      state.columnOrder = newColumnOrder;
    },

    moveTask: (state, action: PayloadAction<any>) => {
      const { source, destination } = action.payload;

      // Same Column Move
      if (source.droppableId === destination.droppableId) {
        const column = state.columns[source.droppableId];
        const newTaskIds = Array.from(column.taskIds);
        const [movedTaskId] = newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, movedTaskId);
        state.columns[source.droppableId].taskIds = newTaskIds;
      }
      // Different Column Move
      else {
        const startColumn = state.columns[source.droppableId];
        const finishColumn = state.columns[destination.droppableId];
        const startTaskIds = Array.from(startColumn.taskIds);
        const finishTaskIds = Array.from(finishColumn.taskIds);
        const [movedTaskId] = startTaskIds.splice(source.index, 1);
        finishTaskIds.splice(destination.index, 0, movedTaskId);
        state.columns[source.droppableId].taskIds = startTaskIds;
        state.columns[destination.droppableId].taskIds = finishTaskIds;
      }
    },

    openTaskDetail: (state, action: PayloadAction<string>) => {
      state.selectedTaskId = action.payload;
    },

    closeTaskDetail: (state) => {
      state.selectedTaskId = null;
    },

    realtimeCommentEvent: (state, action: PayloadAction<{ type: "INSERT" | "UPDATE" | "DELETE", comment?: Comment, commentId?: string, taskId: string }>) => {
      const { type, comment, commentId, taskId } = action.payload;
      if (!state.comments[taskId]) state.comments[taskId] = [];

      if (type === "INSERT" && comment) {
        if (!state.comments[taskId].find(c => c.id === comment.id)) {
          state.comments[taskId].push(comment);
        }
      } else if (type === "UPDATE" && comment) {
        const idx = state.comments[taskId].findIndex(c => c.id === comment.id);
        if (idx !== -1) state.comments[taskId][idx] = comment;
      } else if (type === "DELETE" && commentId) {
        state.comments[taskId] = state.comments[taskId].filter(c => c.id !== commentId && c.parent_id !== commentId);
      }
    },

    realtimeAttachmentEvent: (state, action: PayloadAction<{ type: "INSERT" | "DELETE", attachment?: Attachment, attachmentId?: string, taskId: string }>) => {
      const { type, attachment, attachmentId, taskId } = action.payload;
      if (!state.attachments[taskId]) state.attachments[taskId] = [];

      if (type === "INSERT" && attachment) {
        if (!state.attachments[taskId].find(a => a.id === attachment.id)) {
          // add to top
          state.attachments[taskId].unshift(attachment);
        }
      } else if (type === "DELETE" && attachmentId) {
        state.attachments[taskId] = state.attachments[taskId].filter(a => a.id !== attachmentId);
      }
    },

    realtimeChecklistEvent: (state, action: PayloadAction<{ type: "INSERT" | "UPDATE" | "DELETE", checklist?: Checklist, checklistId?: string, taskId?: string }>) => {
      const { type, checklist, checklistId, taskId } = action.payload;

      if (type === "INSERT" && checklist && taskId) {
        if (!state.checklists[taskId]) state.checklists[taskId] = [];
        if (!state.checklists[taskId].find(c => c.id === checklist.id)) {
          state.checklists[taskId].push({ ...checklist, items: [] });
        }
      } else if (type === "UPDATE" && checklist && taskId) {
        if (!state.checklists[taskId]) state.checklists[taskId] = [];
        const idx = state.checklists[taskId].findIndex(c => c.id === checklist.id);
        if (idx !== -1) {
          state.checklists[taskId][idx] = { ...state.checklists[taskId][idx], ...checklist };
        }
      } else if (type === "DELETE" && checklistId) {
        if (taskId && state.checklists[taskId]) {
          state.checklists[taskId] = state.checklists[taskId].filter(c => c.id !== checklistId);
        } else {
          for (const tId in state.checklists) {
            state.checklists[tId] = state.checklists[tId].filter(c => c.id !== checklistId);
          }
        }
      }
    },

    realtimeChecklistItemEvent: (state, action: PayloadAction<{ type: "INSERT" | "UPDATE" | "DELETE", item?: ChecklistItem, itemId?: string }>) => {
      const { type, item, itemId } = action.payload;

      if ((type === "INSERT" || type === "UPDATE") && item) {
        for (const tId in state.checklists) {
          const checklist = state.checklists[tId].find(c => c.id === item.checklist_id);
          if (checklist) {
            if (type === "INSERT") {
              if (!checklist.items.find(i => i.id === item.id)) {
                checklist.items.push(item);
              }
            } else {
              const idx = checklist.items.findIndex(i => i.id === item.id);
              if (idx !== -1) {
                checklist.items[idx] = item;
              }
            }
            break;
          }
        }
      } else if (type === "DELETE" && itemId) {
        for (const tId in state.checklists) {
          let found = false;
          for (const checklist of state.checklists[tId]) {
            const idx = checklist.items.findIndex(i => i.id === itemId);
            if (idx !== -1) {
              checklist.items.splice(idx, 1);
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    },
  },

  extraReducers: (builder) => {
    addExtraReducers(builder);
  },
});

export const {
  moveTask,
  moveColumn,
  openTaskDetail,
  closeTaskDetail,
  realtimeBoardUpdate,
  realtimeColumnDelete,
  realtimeColumnUpsert,
  realtimeLabelDelete,
  realtimeLabelUpsert,
  realtimeMemberEvent,
  realtimeTaskDelete,
  realtimeTaskLabelEvent,
  realtimeTaskAssigneeEvent,
  realtimeTaskUpsert,
  realtimeCommentEvent,
  realtimeAttachmentEvent,
  realtimeChecklistEvent,
  realtimeChecklistItemEvent,
} = boardDetailSlice.actions;
export default boardDetailSlice.reducer;
