import { api } from "@/lib/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { type Board } from "./types";

interface BoardsState {
  items: Board[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Fetch user's boards
export const fetchBoards = createAsyncThunk(
  "boards/fetchBoards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<any, { success: boolean; data: Board[] }>("/boards");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new board
export const createBoard = createAsyncThunk(
  "boards/createBoard",
  async (
    boardData: { title: string; background: string; type: "public" | "private" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<any, { success: boolean; data: Board }>("/boards", boardData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle Favorite board
export const toggleFavorite = createAsyncThunk(
  "boards/toggleFavorite",
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch<any, { success: boolean; data: Board }>(`/boards/${boardId}/favorite`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    // Realtime update helper triggered by websocket event
    updateBoardRealtime: (state, action) => {
      const index = state.items.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Boards
    builder.addCase(fetchBoards.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBoards.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchBoards.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Board
    builder.addCase(createBoard.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBoard.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items.unshift(action.payload);
    });
    builder.addCase(createBoard.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Toggle Favorite
    builder.addCase(toggleFavorite.fulfilled, (state, action) => {
      const index = state.items.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
  },
});

export const { updateBoardRealtime } = boardsSlice.actions;
export default boardsSlice.reducer;
