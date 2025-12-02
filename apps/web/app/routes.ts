import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Public routes
  layout("components/layouts/AuthLayout.tsx", [
    route("auth/register", "modules/auth/pages/RegisterPage.tsx"),
    route("auth/login", "modules/auth/pages/LoginPage.tsx"),
  ]),

  layout("modules/auth/components/ProtectedRoute.tsx", [
    // Protected routes
    layout("components/layouts/DashboardLayout.tsx", [
      index("modules/dashboard/pages/DashboardPage.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
