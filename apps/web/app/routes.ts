import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";
import { dashboardRoutes } from "./modules/dashboard";
import { authRoutes } from "./modules/auth";

export default [
  // Public routes
  ...authRoutes,

  layout("modules/auth/components/ProtectedRoute.tsx", [
    // Protected routes
    dashboardRoutes,
  ]),
] satisfies RouteConfig;
