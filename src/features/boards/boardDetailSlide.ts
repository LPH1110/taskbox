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
import { supabase } from "@/lib/supabase";
import type { Board, BoardMember } from "./types";

export const fetchBoardDetails = createAsyncThunk(
  "boardDetail/fetchBoardDetails",
  async (boardId: string, { rejectWithValue }) => {
    try {
      // 1. Fetch Board Metadata
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("*")
        .eq("id", boardId)
        .single();

      if (boardError) throw boardError;

      // Fetch Columns
      const { data: columnsData, error: colsError } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", boardId)
        .order("position", { ascending: true });

      if (colsError) throw colsError;

      // Fetch labels
      const { data: labelsData, error: labelsError } = await supabase
        .from("labels")
        .select("*")
        .eq("board_id", boardId);
      if (labelsError) throw labelsError;

      // Fetch Members
      const { data: membersData, error: membersError } = await supabase
        .from("board_members")
        .select("*, profiles(*)")
        .eq("board_id", boardId);

      if (membersError) throw membersError;

      // Fetch Tasks & TaskLabels
      const columnIds = columnsData.map((c) => c.id);
      let tasksData: any[] = [];
      let taskLabelsData: any[] = [];

      if (columnIds.length > 0) {
        // Fetch tasks
        const { data: tData, error: tError } = await supabase
          .from("tasks")
          .select("*")
          .in("column_id", columnIds)
          .order("position", { ascending: true });
        if (tError) throw tError;
        tasksData = tData || [];

        // Fetch relationship: Task <-> Label
        if (tasksData.length > 0) {
          const taskIds = tasksData.map((t) => t.id);
          const { data: tlData, error: tlError } = await supabase
            .from("task_labels")
            .select("*")
            .in("task_id", taskIds);
          if (tlError) throw tlError;
          taskLabelsData = tlData || [];
        }
      }

      return {
        board: boardData,
        columns: columnsData,
        tasks: tasksData,
        labels: labelsData,
        members: membersData,
        taskLabels: taskLabelsData,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- MEMBER ACTIONS ---
export const addMember = createAsyncThunk(
  "boardDetail/addMember",
  async (
    { boardId, email }: { boardId: string; email: string },
    { rejectWithValue }
  ) => {
    try {
      // Find user by email in public profiles
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !userProfile) {
        throw new Error("User not found. Please check the email.");
      }

      // Insert into board_members
      const { data: newMember, error: memberError } = await supabase
        .from("board_members")
        .insert({
          board_id: boardId,
          user_id: userProfile.id,
          role: "member", // Default role
        })
        .select("*, profiles(*)") // Join immediately to get profile info
        .single();

      if (memberError) {
        if (memberError.code === "23505") {
          // Unique violation
          throw new Error("User is already a member of this board.");
        }
        throw memberError;
      }

      return newMember;
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
      // Execute delete query on board_members table
      const { error } = await supabase
        .from("board_members")
        .delete()
        .match({ board_id: boardId, user_id: userId });

      if (error) throw error;

      return userId; // Return userId to update local state
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
      const { data, error } = await supabase
        .from("labels")
        .insert({ board_id: boardId, title, color })
        .select()
        .single();
      if (error) throw error;
      return data;
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
        const { error } = await supabase
          .from("task_labels")
          .insert({ task_id: taskId, label_id: labelId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("task_labels")
          .delete()
          .match({ task_id: taskId, label_id: labelId });
        if (error) throw error;
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
      const { data, error } = await supabase
        .from("labels")
        .update({ title, color })
        .eq("id", labelId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLabel = createAsyncThunk(
  "boardDetail/deleteLabel",
  async (labelId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("labels")
        .delete()
        .eq("id", labelId);

      if (error) throw error;
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
      // 1. Get current column count to determine 'position'
      const { count } = await supabase
        .from("columns")
        .select("*", { count: "exact", head: true })
        .eq("board_id", boardId);

      const position = count ? count : 0;

      // 2. Insert into Supabase
      const { data, error } = await supabase
        .from("columns")
        .insert({ board_id: boardId, title, position })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("columns")
        .update({ title })
        .eq("id", columnId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      // Update the column's board_id and position directly
      const { error } = await supabase
        .from("columns")
        .update({ board_id: targetBoardId, position: newPosition })
        .eq("id", columnId)
        .select()
        .single();

      if (error) throw error;

      // Return the ID to remove it from the current board's state
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
      const { error } = await supabase.from("columns").upsert(updates);
      if (error) throw error;
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
      // Get Original Column
      const { data: originalColumn, error: colError } = await supabase
        .from("columns")
        .select("*")
        .eq("id", columnId)
        .single();

      if (colError) throw colError;

      // Get Original Tasks
      const { data: originalTasks, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("column_id", columnId);

      if (taskError) throw taskError;

      // Create New Column
      const { data: newColumn, error: createColError } = await supabase
        .from("columns")
        .insert({
          board_id: originalColumn.board_id,
          title: newTitle,
          position: originalColumn.position,
        })
        .select()
        .single();

      if (createColError) throw createColError;

      // Clone Tasks (if any)
      let newTasksData: Task[] = [];
      if (originalTasks && originalTasks.length > 0) {
        const tasksToInsert = originalTasks.map((t) => ({
          column_id: newColumn.id,
          board_id: originalColumn.board_id,
          content: t.content,
          description: t.description,
          priority: t.priority,
          position: t.position,
        }));

        const { data: createdTasks, error: createTasksError } = await supabase
          .from("tasks")
          .insert(tasksToInsert)
          .select();

        if (createTasksError) throw createTasksError;
        newTasksData = createdTasks;
      }

      return { newColumn, newTasks: newTasksData, originalColumnId: columnId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteColumn = createAsyncThunk(
  "boardDetail/deleteColumn",
  async (columnId: string, { rejectWithValue }) => {
    try {
      // Delete all tasks in this column first (Safe approach)
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("column_id", columnId);

      if (tasksError) throw tasksError;

      // Delete the column itself
      const { error: colError } = await supabase
        .from("columns")
        .delete()
        .eq("id", columnId);

      if (colError) throw colError;

      return columnId; // Return ID to remove from state
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
      const { error } = await supabase.from("tasks").upsert(updates);
      if (error) throw error;
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
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          column_id: columnId,
          content,
          position: 99999,
          board_id: boardId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
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
      // Get current tasks in destination to find max position
      const { data: targetTasks, error: targetError } = await supabase
        .from("tasks")
        .select("position")
        .eq("column_id", targetColumnId)
        .order("position", { ascending: false })
        .limit(1);

      if (targetError) throw targetError;

      const maxPosition = targetTasks.length > 0 ? targetTasks[0].position : 0;

      // Get tasks from source column (ordered)
      const { data: sourceTasks, error: sourceError } = await supabase
        .from("tasks")
        .select("*")
        .eq("column_id", sourceColumnId)
        .order("position", { ascending: true });

      if (sourceError) throw sourceError;
      if (!sourceTasks || sourceTasks.length === 0)
        return { sourceColumnId, targetColumnId, movedTasks: [] };

      // Prepare updates with new column_id and appended positions
      const updates = sourceTasks.map((task, index) => ({
        ...task,
        column_id: targetColumnId,
        position: maxPosition + 1024 + index * 1024, // Add gap to be safe or just +1
      }));

      // Perform Upsert
      const { data: movedTasks, error: updateError } = await supabase
        .from("tasks")
        .upsert(updates)
        .select();

      if (updateError) throw updateError;

      return { sourceColumnId, targetColumnId, movedTasks };
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
      const movedTaskIds = movedTasks.map((t) => t.id);

      // Remove from Source
      state.columns[sourceColumnId].taskIds = []; // Empty the source

      // Append to Target
      state.columns[targetColumnId].taskIds.push(...movedTaskIds);

      // 2. Update Task Objects
      movedTasks.forEach((task) => {
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
