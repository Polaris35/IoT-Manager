import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useAuth } from "~/context/AuthContext";

export default function DashboardLayout() {
  const { logout, user } = useAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header / App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IoT Manager
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={() => logout()}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5" }}>
        {/* Сюда будут подставляться страницы (DashboardPage, DevicesPage...) */}
        <Outlet />
      </Box>
    </Box>
  );
}
