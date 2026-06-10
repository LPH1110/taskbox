import DashboardLayout from "@/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import BoardDetailPage from "@/features/boards/pages/board-detail-page";
import AnalyticsPage from "@/features/analytics/pages/analytics-page";
import BoardsListPage from "@/features/boards/pages/boards-list-page";
import DashboardPage from "@/features/boards/pages/dashboard-page";
import ProfilePage from "@/features/profile/pages/profile-page";
import SettingsPage from "@/features/settings/pages/settings-page";
import WorkspaceListPage from "@/features/workspaces/pages/workspace-list-page";
import WorkspaceDetailPage from "@/features/workspaces/pages/workspace-detail-page";
import InvitationPage from "@/features/workspaces/pages/invitation-page";
import TimelinePage from "@/features/planner/pages/timeline-page";
import LandingPage from "@/features/landing/pages/landing-page";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
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
            path: "/boards/:boardId/analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "/dashboard",
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
            path: "/workspaces/:workspaceId/planner",
            element: <TimelinePage />,
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
