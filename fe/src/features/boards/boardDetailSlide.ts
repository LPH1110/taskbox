/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  type BoardDetailState,
  type Column,
  type Label,
  type Task,
} from "./types/board-detail";
import { api } from "@/lib/api";
import type { Board, BoardMember } from "./types";

export const fetchBoardDetails = createAsyncThunk(
  "boardDetail/fetchBoardDetails",
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any, any>(`/boards/${boardId}/detail`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- MEMBER ACTIONS ---
export const addMember = createAsyncThunk(
  "boardDetail/addMember",
  async (
    { boardId, userId }: { boardId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, any>(`/boards/${boardId}/members`, { userId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBoardDetails = createAsyncThunk(
  "boardDetail/updateBoardDetails",
  async (
    { boardId, updates }: { boardId: string; updates: { title?: string; type?: "public" | "private" } },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<any, any>(`/boards/${boardId}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMember = createAsyncThunk(
  "boardDetail/removeMember",
  async (
    { boardId, userId }: { boardId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/boards/${boardId}/members/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- LABEL ACTIONS ---
export const createLabel = createAsyncThunk(
  "boardDetail/createLabel",
  async (
    {
      boardId,
      title,
      color,
    }: { boardId: string; title: string; color: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, any>(`/boards/${boardId}/labels`, { title, color });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleTaskLabel = createAsyncThunk(
  "boardDetail/toggleTaskLabel",
  async (
    {
      taskId,
      labelId,
      isAdding,
    }: { taskId: string; labelId: string; isAdding: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (isAdding) {
        await api.post(`/tasks/${taskId}/labels/${labelId}`);
      } else {
        await api.delete(`/tasks/${taskId}/labels/${labelId}`);
      }
      return { taskId, labelId, isAdding };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLabel = createAsyncThunk(
  "boardDetail/updateLabel",
  async (
    {
      labelId,
      title,
      color,
    }: { labelId: string; title: string; color: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<any, any>(`/labels/${labelId}`, { title, color });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLabel = createAsyncThunk(
  "boardDetail/deleteLabel",
  async (labelId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/labels/${labelId}`);
      return labelId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- COLUMN ACTIONS ---

export const createColumn = createAsyncThunk(
  "boardDetail/createColumn",
  async (
    { boardId, title }: { boardId: string; title: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, any>(`/boards/${boardId}/columns`, { title });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateColumn = createAsyncThunk(
  "boardDetail/updateColumn",
  async (
    { columnId, title }: { columnId: string; title: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<any, any>(`/columns/${columnId}`, { title });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveColumnToDifferentBoard = createAsyncThunk(
  "boardDetail/moveColumnToDifferentBoard",
  async (
    {
      columnId,
      targetBoardId,
      newPosition,
    }: { columnId: string; targetBoardId: string; newPosition: number },
    { rejectWithValue }
  ) => {
    try {
      await api.patch(`/columns/${columnId}/move`, { targetBoardId, newPosition });
      return columnId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateColumnOrder = createAsyncThunk(
  "boardDetail/updateColumnOrder",
  async (
    updates: {
      id: string;
      board_id: string;
      position: number;
    }[],
    { rejectWithValue }
  ) => {
    try {
      await api.put(`/columns/reorder`, updates);
      return updates;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const copyColumn = createAsyncThunk(
  "boardDetail/copyColumn",
  async (
    { columnId, newTitle }: { columnId: string; newTitle: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, any>(`/columns/${columnId}/copy`, { newTitle });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteColumn = createAsyncThunk(
  "boardDetail/deleteColumn",
  async (columnId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/columns/${columnId}`);
      return columnId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- TASK ACTIONS ---
export const updateTaskOrder = createAsyncThunk(
  "boardDetail/updateTaskOrder",
  async (
    updates: {
      id: string;
      column_id: string;
      position: number;
      board_id: string;
      content: string;
    }[],
    { rejectWithValue }
  ) => {
    try {
      await api.put(`/tasks/reorder`, updates);
      return updates;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  "boardDetail/createTask",
  async (
    {
      columnId,
      boardId,
      content,
    }: { columnId: string; boardId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, any>(`/columns/${columnId}/tasks`, { boardId, content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "boardDetail/updateTask",
  async (
    { taskId, updates }: { taskId: string; updates: Partial<Task> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<any, any>(`/tasks/${taskId}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "boardDetail/deleteTask",
  async (
    { taskId, columnId }: { taskId: string; columnId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return { taskId, columnId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveAllTasks = createAsyncThunk(
  "boardDetail/moveAllTasks",
  async (
    {
      sourceColumnId,
      targetColumnId,
    }: { sourceColumnId: string; targetColumnId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, any>(`/tasks/move-all`, { sourceColumnId, targetColumnId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// -----------------

const initialState: BoardDetailState = {
  tasks: {},
  columns: {},
  labels: {},
  columnOrder: [],
  members: [],
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
  },

  extraReducers: (builder) => {
    // --- Handle Fetch Board Details ---
    builder
      .addCase(fetchBoardDetails.pending, (state) => {
        if (!state.currentBoard) {
          state.isLoading = true;
        }
      })
      .addCase(fetchBoardDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const { labels, board, columns, tasks, taskLabels, members } =
          action.payload;

        state.currentBoard = board;
        const newTasks: Record<string, Task> = {};
        const newColumns: Record<string, Column> = {};
        const newLabels: Record<string, Label> = {};
        const taskLabelMap: Record<string, string[]> = {};
        const newColumnOrder: string[] = [];

        // Normalize labels
        labels.forEach((l: Label) => {
          newLabels[l.id] = l;
        });
        state.labels = newLabels;

        // Map Task Labels
        // taskId -> [labelId1, labelId2]
        taskLabels.forEach((tl: any) => {
          if (!taskLabelMap[tl.task_id]) taskLabelMap[tl.task_id] = [];
          taskLabelMap[tl.task_id].push(tl.label_id);
        });

        // Process Columns
        columns.forEach((col: Column) => {
          newColumns[col.id] = {
            id: col.id,
            board_id: col.board_id,
            title: col.title,
            position: col.position,
            taskIds: [],
          };
          newColumnOrder.push(col.id);
        });

        // Process Tasks and link to Columns
        tasks.forEach((task: Task) => {
          newTasks[task.id] = {
            id: task.id,
            content: task.content,
            column_id: task.column_id,
            priority: task.priority,
            description: task.description,
            position: task.position,
            labelIds: taskLabelMap[task.id] || [],
          };

          if (newColumns[task.column_id]) {
            newColumns[task.column_id].taskIds.push(task.id);
          }
        });

        state.tasks = newTasks;
        state.columns = newColumns;
        state.columnOrder = newColumnOrder;
        state.members = members || [];
      });

    // --- Handle Add Member
    builder.addCase(addMember.fulfilled, (state, action) => {
      state.members.push(action.payload);
    });

    // --- Handle Update Board Details ---
    builder.addCase(updateBoardDetails.fulfilled, (state, action) => {
      if (state.currentBoard && state.currentBoard.id === action.payload.id) {
        state.currentBoard = { ...state.currentBoard, ...action.payload };
      }
    });

    // --- Handle Remove Member ---
    builder.addCase(removeMember.fulfilled, (state, action) => {
      const removedUserId = action.payload;
      // Filter out the removed member from the list
      state.members = state.members.filter((m) => m.user_id !== removedUserId);
    });

    // --- Handle Create Label
    builder.addCase(createLabel.fulfilled, (state, action) => {
      const label = action.payload;
      state.labels[label.id] = label;
    });

    // --- Handle Update Label ---
    builder.addCase(updateLabel.fulfilled, (state, action) => {
      const updatedLabel = action.payload;
      if (state.labels[updatedLabel.id]) {
        state.labels[updatedLabel.id] = updatedLabel;
      }
    });

    // --- Handle Delete Label ---
    builder.addCase(deleteLabel.fulfilled, (state, action) => {
      const labelId = action.payload;

      delete state.labels[labelId];

      Object.values(state.tasks).forEach((task) => {
        if (task.labelIds && task.labelIds.includes(labelId)) {
          task.labelIds = task.labelIds.filter((id) => id !== labelId);
        }
      });
    });

    // Handle Toggle Task Label
    builder.addCase(toggleTaskLabel.fulfilled, (state, action) => {
      const { taskId, labelId, isAdding } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        if (isAdding) {
          if (!task.labelIds.includes(labelId)) task.labelIds.push(labelId);
        } else {
          task.labelIds = task.labelIds.filter((id) => id !== labelId);
        }
      }
    });

    // --- Handle Create Column --
    builder.addCase(createColumn.fulfilled, (state, action) => {
      const column = action.payload;
      state.columns[column.id] = { ...column, taskIds: [] };
      if (!state.columnOrder.includes(column.id)) {
        state.columnOrder.push(column.id);
      }
    });

    // --- Handle Update Column --
    builder.addCase(updateColumn.fulfilled, (state, action) => {
      const updatedColumn = action.payload;
      if (state.columns[updatedColumn.id]) {
        state.columns[updatedColumn.id].title = updatedColumn.title;
      }
    });

    // --- Handle Copy Column ---
    builder.addCase(copyColumn.fulfilled, (state, action) => {
      const { newColumn, newTasks, originalColumnId } = action.payload;
      state.columns[newColumn.id] = {
        ...newColumn,
        taskIds: newTasks.map((t: any) => t.id),
      };
      newTasks.forEach((task: any) => {
        state.tasks[task.id] = { ...task, labelIds: [] };
      });

      if (!state.columnOrder.includes(newColumn.id)) {
        const index = state.columnOrder.indexOf(originalColumnId);
        if (index !== -1) {
          state.columnOrder.splice(index + 1, 0, newColumn.id);
        } else {
          state.columnOrder.push(newColumn.id);
        }
      }
    });

    // --- Handle Move Column
    builder.addCase(moveColumnToDifferentBoard.fulfilled, (state, action) => {
      const removedColumnId = action.payload;

      // 1. Remove from columns object
      delete state.columns[removedColumnId];

      // 2. Remove from columnOrder array
      state.columnOrder = state.columnOrder.filter(
        (id) => id !== removedColumnId
      );
    });

    // --- Handle Delete Column ---
    builder.addCase(deleteColumn.fulfilled, (state, action) => {
      const columnId = action.payload;

      // Remove tasks associated with this column from state
      if (state.columns[columnId]) {
        const taskIdsToRemove = state.columns[columnId].taskIds;
        taskIdsToRemove.forEach((taskId) => {
          delete state.tasks[taskId];
        });
      }

      // Remove column from dictionary
      delete state.columns[columnId];

      // Remove from order array
      state.columnOrder = state.columnOrder.filter((id) => id !== columnId);
    });

    // --- Handle Create Task ---
    builder.addCase(createTask.fulfilled, (state, action) => {
      const task = action.payload;
      state.tasks[task.id] = {
        ...task,
        labelIds: [],
        position: task.position ?? 99999,
      };
      const col = state.columns[task.column_id];
      if (col && !col.taskIds.includes(task.id)) {
        col.taskIds.push(task.id);
      }
    });
    // --- Handle Update Task ---
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const updatedTask = action.payload;
      if (state.tasks[updatedTask.id]) {
        state.tasks[updatedTask.id] = {
          ...state.tasks[updatedTask.id],
          ...updatedTask,
        };
      }
    });

    // --- Handle Delete Task ---
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      const { taskId, columnId } = action.payload;

      // 1. Remove from tasks object
      delete state.tasks[taskId];

      // 2. Remove from column's taskIds array
      if (state.columns[columnId]) {
        state.columns[columnId].taskIds = state.columns[
          columnId
        ].taskIds.filter((id) => id !== taskId);
      }

      // 3. Close the modal if open
      state.selectedTaskId = null;
    });

    // --- Handle Move All Tasks
    builder.addCase(moveAllTasks.fulfilled, (state, action) => {
      const { sourceColumnId, targetColumnId, movedTasks } = action.payload;

      if (!movedTasks || movedTasks.length === 0) return;

      const sourceColumn = state.columns[sourceColumnId];
      const targetColumn = state.columns[targetColumnId];

      if (!sourceColumn || !targetColumn) return;

      // 1. Move Task IDs in local state
      // Extract IDs that are being moved
      const movedTaskIds = movedTasks.map((t: Task) => t.id);

      // Remove from Source
      state.columns[sourceColumnId].taskIds = []; // Empty the source

      // Append to Target
      state.columns[targetColumnId].taskIds.push(...movedTaskIds);

      // 2. Update Task Objects
      movedTasks.forEach((task: Task) => {
        if (state.tasks[task.id]) {
          state.tasks[task.id].column_id = targetColumnId;
          state.tasks[task.id].position = task.position;
        }
      });
    });
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
  realtimeTaskUpsert,
} = boardDetailSlice.actions;
export default boardDetailSlice.reducer;
