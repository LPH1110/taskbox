import { router } from "@/router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { checkAuthSession } from "./features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { ToastProvider } from "./context/ToastContext";

function App() {
  const dispatch = useAppDispatch();

  const { isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
