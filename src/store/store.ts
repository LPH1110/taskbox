import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import boardsReducer from "@/features/boards/boardsSlice";
import boardDetailReducer from "@/features/boards/boardDetailSlide";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    boardDetail: boardDetailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
