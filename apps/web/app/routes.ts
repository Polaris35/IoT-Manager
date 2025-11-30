import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/AuthLayout.tsx", [
    route("auth/register", "modules/auth/pages/RegisterPage.tsx"),
    route("auth/login", "modules/auth/pages/LoginPage.tsx"),
  ]),
] satisfies RouteConfig;
