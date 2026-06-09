import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export const fetchComments = createAsyncThunk(
  "boardDetail/fetchComments",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any, any>(`/tasks/${taskId}/comments`);
      return { taskId, comments: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  "boardDetail/createComment",
  async ({ taskId, content, parentId }: { taskId: string, content: string, parentId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<any, any>(`/tasks/${taskId}/comments`, { content, parentId });
      return { taskId, comment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  "boardDetail/updateComment",
  async ({ taskId, commentId, content }: { taskId: string, commentId: string, content: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<any, any>(`/comments/${commentId}`, { content });
      return { taskId, comment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  "boardDetail/deleteComment",
  async ({ taskId, commentId }: { taskId: string, commentId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/comments/${commentId}`);
      return { taskId, commentId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
