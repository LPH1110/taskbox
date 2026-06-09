import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export const fetchAttachments = createAsyncThunk(
  "boardDetail/fetchAttachments",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any, any>(`/tasks/${taskId}/attachments`);
      return { taskId, attachments: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadAttachment = createAsyncThunk(
  "boardDetail/uploadAttachment",
  async ({ taskId, file }: { taskId: string, file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<any, any>(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return { taskId, attachment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  "boardDetail/deleteAttachment",
  async ({ taskId, attachmentId }: { taskId: string, attachmentId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/attachments/${attachmentId}`);
      return { taskId, attachmentId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
