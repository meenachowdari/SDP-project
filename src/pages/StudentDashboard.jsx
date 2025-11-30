// src/pages/StudentDashboard.jsx

import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function StudentDashboard() {
  const location = useLocation();

  // if you pass studentId from login route, use that. Otherwise default:
  const studentId = location.state?.studentId || "24003";
  const studentName = location.state?.studentName || "Alex Chen";

  if (location.state?.role !== "student") {
    return <Navigate to="/not-allowed" />;
  }

  // ---- Mock metrics (top cards) ----
  const summary = {
    overallAverage: 89,
    totalAssignments: 12,
    excellentScoresCount: 7,
    successRate: 58,
  };

  // ---- Bar chart: Subject performance ----
  const subjectPerformance = [
    { subject: "Mathematics", score: 88 },
    { subject: "Physics", score: 92 },
    { subject: "Chemistry", score: 86 },
    { subject: "Biology", score: 90 },
    { subject: "English", score: 89 },
  ];

  // ---- Line chart: Performance trend ----
  const performanceTrend = [
    { month: "Sep", score: 82 },
    { month: "Oct", score: 85 },
    { month: "Nov", score: 83 },
    { month: "Dec", score: 90 },
    { month: "Jan", score: 94 },
    { month: "Feb", score: 88 },
    { month: "Mar", score: 86 },
  ];

  // ---- Areas for improvement (static + teacher notes) ----

  // teacher suggestions are stored in localStorage by TeacherDashboard
  const [teacherNotes, setTeacherNotes] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("teacherSuggestions");
      if (!raw) return;
      const all = JSON.parse(raw);
      setTeacherNotes(all[studentId] || []);
    } catch (e) {
      console.error("Failed to read teacher suggestions", e);
    }
  }, [studentId]);

  const areas = [
    {
      title: "Math Performance",
      color: "#e3f2fd", // light blue
      text: "Consider spending more time on algebra and geometry. Practice problems in the resource center.",
    },
    {
      title: "English Excellence",
      color: "#e8f5e9", // light green
      text: "Excellent reading and writing skills. Keep up the regular practice and vocabulary building.",
    },
  ];

  const getSuggestion = (score) => {
    if (score >= 90) return { text: "Excellent – keep it up!", color: "success" };
    if (score >= 75) return { text: "Good – you are strong in this subject", color: "primary" };
    return { text: "Needs improvement – focus more", color: "error" };
  };

  return (
    <>
      <Navbar role="student" />

      <Box sx={{ p: { xs: 2, md: 6 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Student Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {studentName}
          </Typography>
        </Box>

        {/* Top summary cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Overall Average
                </Typography>
                <Typography variant="h4">{summary.overallAverage}%</Typography>
                <Typography variant="body2" color="success.main">
                  Excellent progress!
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Assignments
                </Typography>
                <Typography variant="h4">{summary.totalAssignments}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed this semester
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Excellent Scores
                </Typography>
                <Typography variant="h4">{summary.excellentScoresCount}</Typography>
                <Typography variant="body2" color="warning.main">
                  90% or above
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
                <Typography variant="h4">{summary.successRate}%</Typography>
                <Typography variant="body2" color="success.main">
                  Excellent scores ratio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts row */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3, height: 320 }}>
              <Typography variant="subtitle1">Subject Performance</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Your average scores by subject
              </Typography>

              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: 3, height: 320 }}>
              <Typography variant="subtitle1">Performance Trend</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Your score progression over time
              </Typography>

              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Areas for improvement & teacher suggestions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Areas for Improvement
          </Typography>

          <Stack spacing={2}>
            {areas.map((area) => (
              <Paper
                key={area.title}
                sx={{ p: 2, borderRadius: 3, backgroundColor: area.color }}
              >
                <Typography variant="subtitle1">{area.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {area.text}
                </Typography>
              </Paper>
            ))}

            {/* Teacher notes coming from TeacherDashboard via localStorage */}
            <Paper sx={{ p: 2, borderRadius: 3, backgroundColor: "#fff8e1" }}>
              <Typography variant="subtitle1">Teacher Suggestions</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Feedback shared by your teacher
              </Typography>

              {teacherNotes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No suggestions yet. Your teacher can add notes from the Teacher Dashboard.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {teacherNotes.map((note, idx) => (
                    <Paper key={idx} sx={{ p: 1.5, borderRadius: 2 }} variant="outlined">
                      <Typography variant="body2">{note}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Box>

        {/* Optional: simple subject suggestion chips like your old code */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Quick Subject Suggestions
          </Typography>
          {subjectPerformance.map((s) => {
            const sug = getSuggestion(s.score);
            return (
              <Paper
                key={s.subject}
                sx={{ p: 1.5, mt: 1, display: "flex", justifyContent: "space-between" }}
                variant="outlined"
              >
                <Typography variant="body2">
                  {s.subject}: {s.score}%
                </Typography>
                <Chip label={sug.text} color={sug.color} size="small" />
              </Paper>
            );
          })}
        </Box>
      </Box>
    </>
  );
}
