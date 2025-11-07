// src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ role }) {
  const navigate = useNavigate();

  const dashboardTitle =
    role === "admin" ? "Admin Dashboard" : role === "teacher" ? "Teacher Dashboard" : "Student Dashboard";

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "#eee" }}>
      <Toolbar sx={{ px: { xs: 2, md: 6 } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {dashboardTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {role === "admin" ? "Welcome back, Admin User" : role === "teacher" ? "Welcome back, John Smith" : "Welcome back, Emily Davis"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => {
            navigate("/");
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
