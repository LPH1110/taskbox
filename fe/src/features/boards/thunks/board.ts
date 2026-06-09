import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

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
