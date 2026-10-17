// app/modules/auth/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "~/context/AuthContext";
import { useSseConnection } from "~/hooks/useSseConnection";
import { STORAGE_KEYS } from "~/constants";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      : null;
  const activeToken = isAuthenticated && !isLoading ? token : null;
  useSseConnection(activeToken);

  // Loading state (checking token)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-500">
        <CircularProgress />
      </div>
    );
  }

  // Not authenticated -> Redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  // Authenticated -> Render child routes
  return <Outlet />;
}
