import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { useState } from "react";

export type AddButtonProps = {
  onCreateGroup: () => void;
  onAddDevice: () => void;
};

export default function AddButton(props: AddButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <AddIcon fontSize="inherit" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={handleClose}
        open={open}
      >
        <MenuItem onClick={props.onAddDevice}>
          <ListItemIcon>
            <DevicesOtherIcon fontSize="small" />
          </ListItemIcon>{" "}
          Add device
        </MenuItem>
        <MenuItem onClick={props.onCreateGroup}>
          <ListItemIcon>
            <MeetingRoomIcon fontSize="small" />
          </ListItemIcon>{" "}
          Create Group
        </MenuItem>
      </Menu>
    </>
  );
}
