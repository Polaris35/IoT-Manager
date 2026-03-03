import { index, layout } from "@react-router/dev/routes";

export const dashboardRoutes = layout(
  "modules/dashboard/components/layouts/DashboardLayout.tsx",
  [index("modules/dashboard/pages/DashboardPage.tsx")],
);
