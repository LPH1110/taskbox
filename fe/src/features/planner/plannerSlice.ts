import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

export interface TimelineTask {
  id: string;
  content: string;
  due_date: string;
  priority?: "low" | "medium" | "high";
  board: { id: string; title: string; background_image: string | null };
  column: { title: string };
  assignees: { id: string; full_name: string; avatar_url: string | null }[];
  labels: { id: string; title: string; color: string }[];
}

interface PlannerState {
  tasks: TimelineTask[];
  isLoading: boolean;
  error: string | null;
  view: "week" | "month";
  currentDate: string;
  selectedBoardId: string | null;
}

const initialState: PlannerState = {
  tasks: [],
  isLoading: false,
  error: null,
  view: "week",
  currentDate: new Date().toISOString(),
  selectedBoardId: null,
};

export const fetchTimelineTasks = createAsyncThunk(
  "planner/fetchTimelineTasks",
  async ({ workspaceId, from, to, boardId }: { workspaceId: string, from: string, to: string, boardId?: string | null }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({ from, to });
      if (boardId) queryParams.append("boardId", boardId);
      
      const response = await api.get<any, { success: boolean; data: TimelineTask[] }>(`/workspaces/${workspaceId}/tasks/timeline?${queryParams}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch timeline tasks");
    }
  }
);

const plannerSlice = createSlice({
  name: "planner",
  initialState,
  reducers: {
    setView(state, action: { payload: "week" | "month" }) {
      state.view = action.payload;
    },
    setCurrentDate(state, action: { payload: string }) {
      state.currentDate = action.payload;
    },
    setSelectedBoardId(state, action: { payload: string | null }) {
      state.selectedBoardId = action.payload;
    },
    resetPlanner(state) {
      state.tasks = [];
      state.selectedBoardId = null;
      state.currentDate = new Date().toISOString();
      state.view = "week";
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTimelineTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTimelineTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTimelineTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setView, setCurrentDate, setSelectedBoardId, resetPlanner } = plannerSlice.actions;
export default plannerSlice.reducer;
