// src/pages/Login.jsx
import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // ✅ Password no longer checked — only email decides the role

    // --- Admin login ---
    if (email === "admin@school.com") {
      navigate("/admin-dashboard", { state: { role: "admin" } });
      return;
    }

    // --- Teacher login ---
    if (email === "john@school.com") {
      navigate("/teacher-dashboard", { state: { role: "teacher" } });
      return;
    }

    // --- Student login ---
    if (email === "emily@school.com") {
      navigate("/student-dashboard", { state: { role: "student" } });
      return;
    }

    alert("Invalid email. Try:\nadmin@school.com\njohn@school.com\nemily@school.com");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f6f7fb",
      }}
    >
      <Paper sx={{ width: 420, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Student Performance Analytics
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in to access your dashboard
        </Typography>

        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{ background: "#0f1724" }}
        >
          Sign In
        </Button>

        <Box textAlign="center" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Don't have an account?{" "}
            <Link component="button" onClick={() => navigate("/signup")}>
              Sign up
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 3, color: "text.secondary", fontSize: 13 }}>
          <div><strong>Demo Emails (any password works):</strong></div>
          <div>Admin: admin@school.com</div>
          <div>Teacher: john@school.com</div>
          <div>Student: emily@school.com</div>
        </Box>
      </Paper>
    </Box>
  );
}
