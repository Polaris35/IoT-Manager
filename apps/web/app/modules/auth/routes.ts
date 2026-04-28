import { layout, route, type RouteConfigEntry } from "@react-router/dev/routes";

export const authRoutes = [
  layout("modules/auth/components/layouts/AuthLayout.tsx", [
    route("auth/register", "modules/auth/pages/RegisterPage.tsx"),
    route("auth/login", "modules/auth/pages/LoginPage.tsx"),
  ]),
];

export const withAuth = (routes: RouteConfigEntry[]) => {
  return layout("modules/auth/components/ProtectedRoute.tsx", routes);
};
