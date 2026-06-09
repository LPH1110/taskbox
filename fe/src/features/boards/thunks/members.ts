import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

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
