import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@/app/store/auth-store";

export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
