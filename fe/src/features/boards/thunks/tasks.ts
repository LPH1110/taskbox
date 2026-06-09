import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import { type Task } from "../types/board-detail";

export const updateTaskOrder = createAsyncThunk(
  "boardDetail/updateTaskOrder",
  async (
    updates: { id: string; column_id: string; position: number; board_id: string; content: string }[],
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
    { columnId, boardId, content }: { columnId: string; boardId: string; content: string },
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
    { sourceColumnId, targetColumnId }: { sourceColumnId: string; targetColumnId: string },
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

export const toggleTaskAssignee = createAsyncThunk(
  "boardDetail/toggleTaskAssignee",
  async (
    { taskId, userId, isAdding }: { taskId: string; userId: string; isAdding: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (isAdding) {
        await api.post(`/tasks/${taskId}/assignees/${userId}`);
      } else {
        await api.delete(`/tasks/${taskId}/assignees/${userId}`);
      }
      return { taskId, userId, isAdding };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
