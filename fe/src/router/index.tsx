import { AuthLayout } from "@/components/layout/auth-layout";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import BoardDetailPage from "@/features/boards/pages/board-detail-page";
import BoardsListPage from "@/features/boards/pages/boards-list-page";
import DashboardPage from "@/features/boards/pages/dashboard-page";
import ProfilePage from "@/features/profile/pages/profile-page";
import SettingsPage from "@/features/settings/pages/settings-page";
import WorkspaceListPage from "@/features/workspaces/pages/workspace-list-page";
import WorkspaceDetailPage from "@/features/workspaces/pages/workspace-detail-page";
import InvitationPage from "@/features/workspaces/pages/invitation-page";
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
    path: "/invitations/:token",
    element: <InvitationPage />,
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
            element: <BoardsListPage />,
          },
          {
            path: "/workspaces",
            element: <WorkspaceListPage />,
          },
          {
            path: "/workspaces/:workspaceId",
            element: <WorkspaceDetailPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
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
