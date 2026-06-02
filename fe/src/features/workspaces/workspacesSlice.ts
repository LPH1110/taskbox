import { api } from "@/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Workspace } from "./types";

interface WorkspacesState {
  items: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspacesState = {
  items: [],
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
};

// Fetch user's workspaces
export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchWorkspaces",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<any, { success: boolean; data: Workspace[] }>("/workspaces");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new workspace
export const createWorkspace = createAsyncThunk(
  "workspaces/createWorkspace",
  async (
    workspaceData: { name: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, { success: boolean; data: Workspace }>("/workspaces", workspaceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    setActiveWorkspaceId: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Workspaces
    builder.addCase(fetchWorkspaces.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaces.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
      // Set active workspace to the first one if not set
      if (action.payload.length > 0 && !state.activeWorkspaceId) {
        state.activeWorkspaceId = action.payload[0].id;
      }
    });
    builder.addCase(fetchWorkspaces.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Workspace
    builder.addCase(createWorkspace.pending, (state) => {
      state.error = null;
    });
    builder.addCase(createWorkspace.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.activeWorkspaceId = action.payload.id;
    });
    builder.addCase(createWorkspace.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { setActiveWorkspaceId } = workspacesSlice.actions;
export default workspacesSlice.reducer;
