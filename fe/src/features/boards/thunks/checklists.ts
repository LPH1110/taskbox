import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import { type ChecklistItem } from "../types/board-detail";

export const createChecklist = createAsyncThunk(
  "boardDetail/createChecklist",
  async ({ taskId, title }: { taskId: string, title: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<any, any>(`/tasks/${taskId}/checklists`, { title });
      return { taskId, checklist: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChecklist = createAsyncThunk(
  "boardDetail/updateChecklist",
  async ({ checklistId, title }: { checklistId: string, title: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch<any, any>(`/checklists/${checklistId}`, { title });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChecklist = createAsyncThunk(
  "boardDetail/deleteChecklist",
  async ({ taskId, checklistId }: { taskId: string, checklistId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/checklists/${checklistId}`);
      return { taskId, checklistId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChecklistItem = createAsyncThunk(
  "boardDetail/createChecklistItem",
  async ({ checklistId, content }: { checklistId: string, content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<any, any>(`/checklists/${checklistId}/items`, { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChecklistItem = createAsyncThunk(
  "boardDetail/updateChecklistItem",
  async ({ itemId, updates }: { itemId: string, updates: Partial<ChecklistItem> }, { rejectWithValue }) => {
    try {
      const response = await api.patch<any, any>(`/checklists/items/${itemId}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChecklistItem = createAsyncThunk(
  "boardDetail/deleteChecklistItem",
  async (itemId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/checklists/items/${itemId}`);
      return { itemId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
