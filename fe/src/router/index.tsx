import { AuthLayout } from "@/components/layout/auth-layout";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import BoardDetailPage from "@/features/boards/pages/board-detail-page";
import DashboardPage from "@/features/boards/pages/dashboard-page";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    // Public Routes (Login, Register, Landing Page)
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginForm />,
      },
      { path: "/register", element: <RegisterForm /> },
    ],
  },
  {
    // Protected Routes (Dashboard, Boards, Tasks)
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/boards/:boardId",
            element: <BoardDetailPage />,
          },
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/boards",
            element: <div>All Boards List Component</div>,
          },
        ],
      },
    ],
  },
  {
    // Catch-all (404)
    path: "*",
    element: <div className="p-10 text-center">404 - Not Found</div>,
  },
]);
