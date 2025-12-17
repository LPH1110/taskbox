import { supabase } from "@/lib/supabase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { type Board, type BoardState } from "./types";

// Initial State
const initialState: BoardState = {
  boards: [],
  isLoading: false,
  error: null,
};

// 1. Fetch Boards (Real API)
export const fetchBoards = createAsyncThunk(
  "boards/fetchBoards",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Board[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Create Board (Real API)
export const createBoard = createAsyncThunk(
  "boards/createBoard",
  async (
    { title, background }: { title: string; background: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const { auth } = getState() as any;
      if (!auth.user) throw new Error("User not found");

      const newBoard = {
        title,
        background_image: background,
        owner_id: auth.user.id,
        type: "private",
      };

      const { data, error } = await supabase
        .from("boards")
        .insert(newBoard)
        .select()
        .single(); // Trả về object vừa tạo

      if (error) throw error;
      return data as Board;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleBoardFavorite = createAsyncThunk(
  "boards/toggleFavorite",
  async (
    { boardId, isFavorite }: { boardId: string; isFavorite: boolean },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from("boards")
        .update({ is_favorite: !isFavorite })
        .eq("id", boardId)
        .select()
        .single();

      if (error) throw error;
      return data as Board;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    // Reducer đồng bộ (nếu cần)
  },
  extraReducers: (builder) => {
    // Fetch Cases
    builder.addCase(fetchBoards.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchBoards.fulfilled, (state, action) => {
      state.isLoading = false;
      state.boards = action.payload;
    });
    builder.addCase(fetchBoards.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Cases
    builder.addCase(createBoard.fulfilled, (state, action) => {
      state.boards.unshift(action.payload);
    });

    // HANDLE TOGGLE FAVORITE
    builder.addCase(toggleBoardFavorite.fulfilled, (state, action) => {
      const index = state.boards.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
    });
  },
});

export default boardsSlice.reducer;
