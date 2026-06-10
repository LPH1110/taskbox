import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import boardsReducer from "@/features/boards/boardsSlice";
import boardDetailReducer from "@/features/boards/boardDetailSlide";
import workspacesReducer from "@/features/workspaces/workspacesSlice";
import plannerReducer from "@/features/planner/plannerSlice";
import analyticsReducer from "@/features/analytics/analyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    boardDetail: boardDetailReducer,
    workspaces: workspacesReducer,
    planner: plannerReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
