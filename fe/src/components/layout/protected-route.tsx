import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export function ProtectedRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to landing page but save the location they tried to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
