import { api } from "@/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// 1. Check Session (fetches /auth/me using JWT token in header)
export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("taskbox_token");
      if (!token) return null;

      const response = await api.get<any, { success: boolean; data: User }>("/auth/me");
      return response.data;
    } catch (error: any) {
      localStorage.removeItem("taskbox_token");
      return rejectWithValue(error.message);
    }
  }
);

// 2. Login (POST /auth/login)
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const response = await api.post<any, { success: boolean; data: { token: string; user: User } }>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("taskbox_token", response.data.token);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Register (POST /auth/register)
export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password, fullName }: any, { rejectWithValue }) => {
    try {
      const response = await api.post<any, { success: boolean; data: { token: string; user: User } }>("/auth/register", {
        email,
        password,
        fullName,
      });

      localStorage.setItem("taskbox_token", response.data.token);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    localStorage.removeItem("taskbox_token");
    return null;
  }
);

// 5. Login with Google (Redirects the browser directly to Express OAuth route)
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      window.location.href = `${API_BASE_URL}/api/auth/google`;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOAuthToken: (state, action) => {
      localStorage.setItem("taskbox_token", action.payload);
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    // Check Session
    builder.addCase(checkAuthSession.pending, (state) => {
      // Do not set isLoading = true here, as it will unmount the RouterProvider in App.tsx
      // state.isLoading is already true by default for the initial load.
    });
    builder.addCase(checkAuthSession.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload;
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
    });
    builder.addCase(checkAuthSession.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { setOAuthToken } = authSlice.actions;
export default authSlice.reducer;
