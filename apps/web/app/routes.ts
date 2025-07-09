import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/AuthLayout.tsx", [
    route("auth/register", "pages/auth/RegisterPage.tsx"),
    route("auth/login", "pages/auth/LoginPage.tsx"),
  ]),
] satisfies RouteConfig;
