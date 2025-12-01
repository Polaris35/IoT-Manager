import { Navigate, Outlet, useLocation } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "~/context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Состояние загрузки (проверка токена)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <CircularProgress />
      </div>
    );
  }

  // 2. Если не авторизован — редирект на логин
  if (!isAuthenticated) {
    // replace: true — чтобы кнопка "Назад" в браузере не возвращала на защищенную страницу
    // state: { from: location } — передаем текущий URL, чтобы вернуться после логина
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. Если авторизован — рендерим дочерние роуты
  return <Outlet />;
}
