import { api } from "@/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Workspace, WorkspaceMember, ActivityLog, WorkspaceInvitation } from "./types";

interface WorkspacesState {
  items: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  members: WorkspaceMember[];
  isMembersLoading: boolean;
  activities: ActivityLog[];
  isActivitiesLoading: boolean;
  hasMoreActivities: boolean;
  activityPage: number;
  invitations: WorkspaceInvitation[];
  isInvitationsLoading: boolean;
}

const initialState: WorkspacesState = {
  items: [],
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
  members: [],
  isMembersLoading: false,
  activities: [],
  isActivitiesLoading: false,
  hasMoreActivities: false,
  activityPage: 1,
  invitations: [],
  isInvitationsLoading: false,
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

// Fetch workspace members
export const fetchWorkspaceMembers = createAsyncThunk(
  "workspaces/fetchWorkspaceMembers",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any, { success: boolean; data: WorkspaceMember[] }>(`/workspaces/${workspaceId}/members`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch workspace invitations
export const fetchWorkspaceInvitations = createAsyncThunk(
  "workspaces/fetchWorkspaceInvitations",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<any, { success: boolean; data: WorkspaceInvitation[] }>(`/workspaces/${workspaceId}/invitations`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create workspace invitation
export const createWorkspaceInvitation = createAsyncThunk(
  "workspaces/createWorkspaceInvitation",
  async (
    { workspaceId, email, role }: { workspaceId: string; email: string; role: "admin" | "member" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, { success: boolean; data: WorkspaceInvitation }>(
        `/workspaces/${workspaceId}/invitations`,
        { email, role }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Cancel workspace invitation
export const cancelWorkspaceInvitation = createAsyncThunk(
  "workspaces/cancelWorkspaceInvitation",
  async (
    { workspaceId, invitationId }: { workspaceId: string; invitationId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.delete<any, { success: boolean; data: WorkspaceInvitation }>(
        `/workspaces/${workspaceId}/invitations/${invitationId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update workspace member role
export const updateWorkspaceMemberRole = createAsyncThunk(
  "workspaces/updateWorkspaceMemberRole",
  async (
    { workspaceId, userId, role }: { workspaceId: string; userId: string; role: "admin" | "member" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<any, { success: boolean; data: WorkspaceMember }>(
        `/workspaces/${workspaceId}/members/${userId}`,
        { role }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove workspace member
export const removeWorkspaceMember = createAsyncThunk(
  "workspaces/removeWorkspaceMember",
  async (
    { workspaceId, userId }: { workspaceId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await api.delete<any, { success: boolean }>(`/workspaces/${workspaceId}/members/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch workspace activity logs
export const fetchWorkspaceActivity = createAsyncThunk(
  "workspaces/fetchWorkspaceActivity",
  async (
    { workspaceId, page = 1, limit = 15 }: { workspaceId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<
        any,
        {
          success: boolean;
          data: {
            activities: ActivityLog[];
            hasMore: boolean;
            page: number;
          };
        }
      >(`/workspaces/${workspaceId}/activity?page=${page}&limit=${limit}`);
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
    resetActivityPage: (state) => {
      state.activities = [];
      state.activityPage = 1;
      state.hasMoreActivities = false;
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

    // Fetch Workspace Members
    builder.addCase(fetchWorkspaceMembers.pending, (state) => {
      state.isMembersLoading = true;
    });
    builder.addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
      state.isMembersLoading = false;
      state.members = action.payload;
    });
    builder.addCase(fetchWorkspaceMembers.rejected, (state) => {
      state.isMembersLoading = false;
    });

    // Fetch Workspace Invitations
    builder.addCase(fetchWorkspaceInvitations.pending, (state) => {
      state.isInvitationsLoading = true;
    });
    builder.addCase(fetchWorkspaceInvitations.fulfilled, (state, action) => {
      state.isInvitationsLoading = false;
      state.invitations = action.payload;
    });
    builder.addCase(fetchWorkspaceInvitations.rejected, (state) => {
      state.isInvitationsLoading = false;
    });

    // Create Workspace Invitation
    builder.addCase(createWorkspaceInvitation.fulfilled, (state, action) => {
      state.invitations.unshift(action.payload);
    });

    // Cancel Workspace Invitation
    builder.addCase(cancelWorkspaceInvitation.fulfilled, (state, action) => {
      const index = state.invitations.findIndex((inv) => inv.id === action.payload.id);
      if (index !== -1) {
        state.invitations[index] = action.payload;
      }
    });

    // Update Workspace Member Role
    builder.addCase(updateWorkspaceMemberRole.fulfilled, (state, action) => {
      const index = state.members.findIndex((m) => m.user_id === action.payload.user_id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    });

    // Remove Workspace Member
    builder.addCase(removeWorkspaceMember.fulfilled, (state, action) => {
      state.members = state.members.filter((m) => m.user_id !== action.payload);
    });

    // Fetch Workspace Activity
    builder.addCase(fetchWorkspaceActivity.pending, (state) => {
      state.isActivitiesLoading = true;
    });
    builder.addCase(fetchWorkspaceActivity.fulfilled, (state, action) => {
      state.isActivitiesLoading = false;
      if (action.payload.page === 1) {
        state.activities = action.payload.activities;
      } else {
        state.activities = [...state.activities, ...action.payload.activities];
      }
      state.hasMoreActivities = action.payload.hasMore;
      state.activityPage = action.payload.page;
    });
    builder.addCase(fetchWorkspaceActivity.rejected, (state) => {
      state.isActivitiesLoading = false;
    });
  },
});

export const { setActiveWorkspaceId, resetActivityPage } = workspacesSlice.actions;
export default workspacesSlice.reducer;

