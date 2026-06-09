import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

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
    { columnId, targetBoardId, newPosition }: { columnId: string; targetBoardId: string; newPosition: number },
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
    updates: { id: string; board_id: string; position: number }[],
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
