import { IconButton, Popover, Typography } from "@mui/material";
import { useState } from "react";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export const HelpPopover = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography
          sx={{
            p: 2,
            maxWidth: 500,
            whiteSpace: "pre-line", // 改行を反映させる
          }}
        >
          <strong>{title}</strong>
          <br />
          {content}
        </Typography>
      </Popover>
    </>
  );
};

// const HelpIcon = ({ message }: { message: string }) => (
//   <Tooltip title={message} arrow>
//     <IconButton size="small">
//       <HelpOutlineIcon fontSize="small" />
//     </IconButton>
//   </Tooltip>
// );
