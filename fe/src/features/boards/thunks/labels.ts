import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export const createLabel = createAsyncThunk(
  "boardDetail/createLabel",
  async (
    { boardId, title, color }: { boardId: string; title: string; color: string },
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
    { taskId, labelId, isAdding }: { taskId: string; labelId: string; isAdding: boolean },
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
    { labelId, title, color }: { labelId: string; title: string; color: string },
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
