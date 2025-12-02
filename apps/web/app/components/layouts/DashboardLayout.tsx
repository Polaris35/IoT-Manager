import { useState } from "react";
import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import AppNavbar from "./AppNavbar";
import SideMenu from "./SideMenu";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    // Using Box allows easy access to theme.palette and sx prop
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        // Automatically sets background color based on the active theme (light/dark)
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar Navigation */}
      <SideMenu
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant="permanent"
      />

      {/* Main Content Column */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <AppNavbar onMenuClick={handleDrawerToggle} />

        {/* Scrollable Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: { xs: 2, md: 3 }, // Responsive padding
          }}
        >
          {/* Centered container for content */}
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </Box>
      </Box>
    </Box>
  );
}
