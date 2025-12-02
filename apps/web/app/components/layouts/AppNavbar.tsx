import * as React from "react";
import { useLocation } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import { alpha } from "@mui/material/styles"; // Для прозрачности

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
        // 1. Убираем дефолты
        backgroundImage: "none",

        // 2. ФОН: Твоя настройка 0.3 + легкий градиент для "блика"
        backgroundColor: (theme) =>
          alpha(theme.palette.background.default, 0.3),

        // 3. РАЗМЫТИЕ: Увеличиваем, чтобы при 0.3 контент снизу не мешал
        backdropFilter: "blur(24px)",

        // 4. ГРАНИЦА: Очень тонкая, едва заметная
        borderBottom: "1px solid",
        borderColor: (theme) => alpha(theme.palette.divider, 0.1),

        // 5. СВЕЧЕНИЕ (ГЛАВНАЯ ФИШКА)
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? // Темная тема: Широкое, слабое свечение основным цветом (синим)
              `0 8px 32px -4px ${alpha(theme.palette.primary.main, 0.15)}`
            : // Светлая тема: Мягкая серая тень для объема
              `0 8px 32px -4px ${alpha(theme.palette.grey[400], 0.2)}`,

        // 6. Слои и анимация
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
            color: "text.primary", // Текст всегда контрастный (черный/белый)
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
