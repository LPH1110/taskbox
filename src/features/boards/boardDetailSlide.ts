import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  type BoardDetailState,
  type Column,
  type Task,
} from "./types/board-detail";
import { supabase } from "@/lib/supabase";

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

      // Fetch Tasks (for all columns in this board)
      const columnIds = columnsData.map((c) => c.id);
      let tasksData: any[] = [];
      if (columnIds.length > 0) {
        const { data, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .in("column_id", columnIds)
          .order("position", { ascending: true });

        if (tasksError) throw tasksError;
        tasksData = data || [];
      }

      return { board: boardData, columns: columnsData, tasks: tasksData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskOrder = createAsyncThunk(
  "boardDetail/updateTaskOrder",
  async (
    updates: {
      id: string;
      board_id: string;
      position: number;
      title: string;
    }[],
    { rejectWithValue }
  ) => {
    try {
      // Upsert allows us to update multiple rows at once if we provide their IDs
      const { error } = await supabase.from("tasks").upsert(updates);
      if (error) throw error;
      return updates;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

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
      const { data, error } = await supabase
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
    updates: { id: string; board_id: string; position: number }[],
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
          column_id: newColumn.id, // Link to new column
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

export const createTask = createAsyncThunk(
  "boardDetail/createTask",
  async (
    { columnId, content }: { columnId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      // Get 'position' logic similar to columns if needed, or default to bottom
      const { data, error } = await supabase
        .from("tasks")
        .insert({ column_id: columnId, content, position: 99999 })
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

const initialState: BoardDetailState = {
  tasks: {},
  columns: {},
  columnOrder: [],
  isLoading: false,
  selectedTaskId: null,
  currentBoard: null,
};

const boardDetailSlice = createSlice({
  name: "boardDetail",
  initialState,
  reducers: {
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
        state.isLoading = true;
      })
      .addCase(fetchBoardDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        const { board, columns, tasks } = action.payload;

        state.currentBoard = board;
        const newTasks: Record<string, Task> = {};
        const newColumns: Record<string, Column> = {};
        const newColumnOrder: string[] = [];

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
          };

          if (newColumns[task.column_id]) {
            newColumns[task.column_id].taskIds.push(task.id);
          }
        });

        state.tasks = newTasks;
        state.columns = newColumns;
        state.columnOrder = newColumnOrder;
      });

    // --- Handle Create Column --
    builder.addCase(createColumn.fulfilled, (state, action) => {
      const column = action.payload;
      // 1. Add to normalized columns object
      state.columns[column.id] = { ...column, taskIds: [] };
      // 2. Add to order array
      state.columnOrder.push(column.id);
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

      // 1. Add new column to dictionary
      state.columns[newColumn.id] = {
        ...newColumn,
        taskIds: newTasks.map((t) => t.id),
      };

      // 2. Add new tasks to dictionary
      newTasks.forEach((task) => {
        state.tasks[task.id] = task;
      });

      // 3. Insert new column ID into columnOrder RIGHT AFTER the original one
      const index = state.columnOrder.indexOf(originalColumnId);
      if (index !== -1) {
        state.columnOrder.splice(index + 1, 0, newColumn.id);
      } else {
        state.columnOrder.push(newColumn.id); // Fallback
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
      state.tasks[task.id] = task;
      state.columns[task.column_id].taskIds.push(task.id);
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

export const { moveTask, moveColumn, openTaskDetail, closeTaskDetail } =
  boardDetailSlice.actions;
export default boardDetailSlice.reducer;
