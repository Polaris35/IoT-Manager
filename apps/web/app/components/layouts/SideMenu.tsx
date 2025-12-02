import { NavLink } from "react-router";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";

// Иконки
import DashboardIcon from "@mui/icons-material/DashboardRounded";
import DevicesIcon from "@mui/icons-material/DevicesOtherRounded"; // Или Sensors
import GroupIcon from "@mui/icons-material/MeetingRoomRounded"; // Для комнат/групп
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import LogoutIcon from "@mui/icons-material/LogoutRounded";

import { useAuth } from "~/context/AuthContext";
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

const drawerWidth = 240;

const mainListItems = [
  { text: "Overview", icon: <DashboardIcon />, path: "/" },
  { text: "Devices", icon: <DevicesIcon />, path: "/devices" },
  { text: "Groups", icon: <GroupIcon />, path: "/groups" },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "temporary"; // permanent для десктопа, temporary для мобилок
}

// ... импорты те же ...

export default function SideMenu({ open, onClose, variant }: SideMenuProps) {
  const { user, logout } = useAuth();

  const drawerContent = (
    <Stack
      sx={{
        height: "100%",
        // paper дает белый в светлой и темно-серый в темной теме
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Логотип */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3, // Горизонтальный отступ
          borderBottom: "1px solid", // Линия, которая сойдется с навбаром
          borderColor: "divider", // Тот же цвет, что у навбара
        }}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
          IoT
        </div>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          Manager
        </Typography>
      </Box>

      {/* <Divider /> */}

      {/* Меню */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 2 }}>
        <List dense>
          {mainListItems.map((item) => (
            <ListItem key={item.text} disablePadding className="block mb-1">
              <ListItemButton
                component={NavLink}
                to={item.path}
                // Tailwind логика для NavLink active state не работает напрямую внутри MUI компонента так просто,
                // поэтому используем sx для selected state, но классы для остального.
                sx={{
                  borderRadius: 2,
                  "&.active": {
                    bgcolor: "primary.50",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                }}
                onClick={variant === "temporary" ? onClose : undefined}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List dense>
          {" "}
          {secondaryListItems.map((item) => (
            <ListItem key={item.text} disablePadding className="block mb-1">
              <ListItemButton
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  "&.active": {
                    bgcolor: "primary.50",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                }}
                onClick={variant === "temporary" ? onClose : undefined}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Профиль */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Avatar
          alt={user?.email || "User"}
          src="/static/images/avatar/1.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            {user?.fullName || "User"}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: "text.secondary" }}>
            {user?.email}
          </Typography>
        </Box>
        <IconButton onClick={() => logout()} size="small">
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Мобильный Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Десктопный Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: 0,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
