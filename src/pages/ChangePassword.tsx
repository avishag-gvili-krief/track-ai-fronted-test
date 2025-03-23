import React from "react";
import { Box, Typography } from "@mui/material";

export default function ChangePassword() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Change Password
      </Typography>
      <Typography variant="body1">
        This is the Change Password page. Here you can update your password securely.
      </Typography>
    </Box>
  );
}
