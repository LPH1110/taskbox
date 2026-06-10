import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";
import type { BoardAnalytics } from "./types";

interface AnalyticsState {
  data: BoardAnalytics | null;
  isLoading: boolean;
  error: string | null;
  boardId: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
  boardId: null,
};

export const fetchBoardAnalytics = createAsyncThunk(
  "analytics/fetchBoardAnalytics",
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any, { success: boolean; data: BoardAnalytics }>(`/boards/${boardId}/analytics`);
      return { boardId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch analytics");
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalytics(state) {
      state.data = null;
      state.boardId = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBoardAnalytics.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBoardAnalytics.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload.data;
      state.boardId = action.payload.boardId;
    });
    builder.addCase(fetchBoardAnalytics.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
