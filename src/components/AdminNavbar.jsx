import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "#ffffff",
        color: "#000",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Student Performance Analyzer
        </Typography>

        <Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => navigate("/")}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
