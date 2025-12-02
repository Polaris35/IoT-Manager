import * as React from "react";
import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import AppNavbar from "./AppNavbar";
import SideMenu from "./SideMenu";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    // Box вместо div. Это позволяет использовать sx и доступ к theme.palette
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        // ВАЖНО: Это делает фон темным в dark mode и серым в light mode автоматически
        bgcolor: "background.default",
      }}
    >
      {/* Сайдбар */}
      <SideMenu
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant="permanent"
      />

      {/* Основная колонка */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Хедер */}
        <AppNavbar onMenuClick={handleDrawerToggle} />

        {/* Область контента */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: { xs: 2, md: 3 }, // Адаптивные отступы
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </Box>
      </Box>
    </Box>
  );
}
