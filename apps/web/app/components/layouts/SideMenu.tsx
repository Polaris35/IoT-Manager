import { NavLink } from "react-router";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";

// Icons
import DashboardIcon from "@mui/icons-material/DashboardRounded";
import DevicesIcon from "@mui/icons-material/DevicesOtherRounded";
import GroupIcon from "@mui/icons-material/MeetingRoomRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import LogoutIcon from "@mui/icons-material/LogoutRounded";

import { useAuth } from "~/context/AuthContext";

const DRAWER_WIDTH = 240;

// === Types & Config ===
interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { text: "Overview", icon: <DashboardIcon />, path: "/" },
  { text: "Devices", icon: <DevicesIcon />, path: "/devices" },
  { text: "Groups", icon: <GroupIcon />, path: "/groups" },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "temporary";
}

// === Helper Component to avoid code duplication ===
function MenuLinkItem({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  return (
    <ListItem disablePadding sx={{ display: "block", mb: 1 }}>
      <ListItemButton
        component={NavLink}
        to={item.path}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          // React Router automatically adds 'active' class to NavLink
          "&.active": {
            bgcolor: "primary.50",
            color: "primary.main",
            "& .MuiListItemIcon-root": { color: "primary.main" },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{ fontWeight: 500 }}
        />
      </ListItemButton>
    </ListItem>
  );
}

// === Main Component ===
export default function SideMenu({ open, onClose, variant }: SideMenuProps) {
  const { user, logout } = useAuth();

  const drawerContent = (
    <Stack
      sx={{
        height: "100%",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* 1. Logo Section */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Brand Icon (using Tailwind for simple shape) */}
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-bold text-white">
          IoT
        </div>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          Manager
        </Typography>
      </Box>

      {/* 2. Navigation Lists */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 2 }}>
        <List dense>
          {MAIN_NAV_ITEMS.map((item) => (
            <MenuLinkItem
              key={item.path}
              item={item}
              onClick={variant === "temporary" ? onClose : undefined}
            />
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List dense>
          {SECONDARY_NAV_ITEMS.map((item) => (
            <MenuLinkItem
              key={item.path}
              item={item}
              onClick={variant === "temporary" ? onClose : undefined}
            />
          ))}
        </List>
      </Box>

      {/* 3. User Profile Footer */}
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
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            border: 0, // Border is handled by the stack content
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
