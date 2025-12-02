import { useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import { alpha } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/MenuRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsRounded";
import ColorModeSelect from "~/theme/ColorModeSelect";

interface AppNavbarProps {
  onMenuClick: () => void;
}

const getPageTitle = (pathname: string): string => {
  if (pathname.includes("/devices")) return "Devices";
  if (pathname.includes("/groups")) return "Groups";
  if (pathname.includes("/settings")) return "Settings";
  return "Dashboard";
};

export default function AppNavbar({ onMenuClick }: AppNavbarProps) {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <AppBar
      position="sticky"
      enableColorOnDark
      sx={{
        // Reset default styles
        backgroundImage: "none",

        // Background: Custom opacity (0.3) for glass effect
        backgroundColor: (theme) =>
          alpha(theme.palette.background.default, 0.3),

        // Blur: Increased to 24px so content below is readable
        backdropFilter: "blur(24px)",

        // Border: Subtle bottom separator
        borderBottom: "1px solid",
        borderColor: (theme) => alpha(theme.palette.divider, 0.1),

        //   Glow/Shadow:
        // - Dark mode: Soft primary color glow
        // - Light mode: Gentle grey shadow for depth
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? `0 8px 32px -4px ${alpha(theme.palette.primary.main, 0.15)}`
            : `0 8px 32px -4px ${alpha(theme.palette.grey[400], 0.2)}`,

        // Layering and transitions
        zIndex: (theme) => theme.zIndex.drawer + 1,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: "none" }, color: "text.primary" }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <ColorModeSelect />

          <IconButton>
            <Badge badgeContent={4} color="error" variant="dot">
              <NotificationsIcon sx={{ color: "text.secondary" }} />
            </Badge>
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
