// src/pages/NotAllowed.jsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotAllowed() {
  const navigate = useNavigate();
  return (
    <Box sx={{ p: 6 }}>
      <Typography variant="h4" color="error" sx={{ mb: 2 }}>
        ❌ You are not allowed to access this page.
      </Typography>
      <Typography sx={{ mb: 3 }}>Please login with correct role to view this dashboard.</Typography>
      <Button variant="contained" onClick={() => navigate("/")}>Go to Login</Button>
    </Box>
  );
}
