import { supabase } from "@/lib/supabase";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

// Define the shape of the user object (simplify for now, expand later based on DB)
interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

// Define the initial state interface
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

export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      // Get profile info from 'public.profiles' table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      return {
        id: session.user.id,
        email: session.user.email!,
        fullName: profile?.full_name || session.user.user_metadata.full_name,
        avatarUrl: profile?.avatar_url,
      } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Fetch profile data after login
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      return {
        id: data.user.id,
        email: data.user.email!,
        fullName: profile?.full_name,
        avatarUrl: profile?.avatar_url,
      } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password, fullName }: any, { rejectWithValue }) => {
    try {
      // Sign up with extra metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // This will trigger our SQL function to insert into 'profiles'
          },
        },
      });
      if (error) throw error;

      if (!data.user) throw new Error("Registration failed");

      return {
        id: data.user.id,
        email: data.user.email!,
        fullName: fullName,
      } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async () => await supabase.auth.signOut()
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // 1. Check Session
    builder.addCase(checkAuthSession.pending, (state) => {
      state.isLoading = true;
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
    });

    // 2. Login
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

    // 3. Register
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

    // 4. Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });

    // 5. Handle Google Login
    builder.addCase(loginWithGoogle.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithGoogle.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export default authSlice.reducer;
