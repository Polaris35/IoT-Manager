// app/modules/auth/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "~/context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Loading state (checking token)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <CircularProgress />
      </div>
    );
  }

  // Not authenticated -> Redirect to login
  if (!isAuthenticated) {
    // replace: true - prevents going back to the protected route via browser "Back" button
    // state: { from: location } - saves current URL to redirect back after successful login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Authenticated -> Render child routes
  return <Outlet />;
}
