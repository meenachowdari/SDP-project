// src/pages/StudentDashboard.jsx

import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { Box, Grid, Paper, Typography, Chip } from "@mui/material";

export default function StudentDashboard() {
  const location = useLocation();
  if (location.state?.role !== "student") return <Navigate to="/not-allowed" />;

  const subjects = [
    { subject: "Math", score: 85 },
    { subject: "Science", score: 89 },
    { subject: "English", score: 97 },
  ];

  const getSuggestion = (score) => {
    if (score >= 90) return { text: "Excellent – Keep it up!", color: "success" };
    if (score >= 75) return { text: "Good – You are strong in this subject", color: "primary" };
    return { text: "Needs Improvement – Focus more", color: "error" };
  };

  return (
    <>
      <Navbar role="student" />

      <Box sx={{ p: { xs: 2, md: 6 } }}>
        
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Subject Suggestions</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Personalized performance insights</Typography>

          {subjects.map((s) => {
            const suggestion = getSuggestion(s.score);
            return (
              <Paper key={s.subject} sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1">{s.subject}: {s.score}%</Typography>
                <Chip 
                  label={suggestion.text} 
                  color={suggestion.color} 
                  sx={{ mt: 1 }}
                />
              </Paper>
            );
          })}
        </Paper>

      </Box>
    </>
  );
}
