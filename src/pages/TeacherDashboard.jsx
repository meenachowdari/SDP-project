// src/pages/TeacherDashboard.jsx
import React, { useState, useMemo } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";

/*
  CLEAN VERSION (NO REPORTS TAB)
  - Overview
  - Students
  - Performance
  - Analytics
*/

const defaultStudents = [
  {
    id: "s1",
    name: "Emily Davis",
    email: "emily@school.com",
    class: "Grade 10A",
    enrolled: "Sep 1, 2024",
    attendance: 95,
    assessments: [
      { title: "Quiz 1", date: "2024-09-15", score: 85, max: 100 },
      { title: "Midterm", date: "2024-10-01", score: 78, max: 100 },
      { title: "Quiz 2", date: "2024-10-15", score: 92, max: 100 },
      { title: "Assignment 1", date: "2024-10-20", score: 88, max: 100 }
    ],
    subjectScores: { Math: 86, Science: 89, English: 95, History: 82, Art: 78 }
  },
  {
    id: "s2",
    name: "James Wilson",
    email: "james@school.com",
    class: "Grade 10A",
    enrolled: "Sep 1, 2024",
    attendance: 92,
    assessments: [
      { title: "Quiz 1", date: "2024-09-15", score: 72, max: 100 },
      { title: "Midterm", date: "2024-10-01", score: 68, max: 100 },
      { title: "Quiz 2", date: "2024-10-15", score: 75, max: 100 },
      { title: "Assignment 1", date: "2024-10-20", score: 80, max: 100 }
    ],
    subjectScores: { Math: 75, Science: 78, English: 81, History: 70, Art: 68 }
  },
  {
    id: "s3",
    name: "Rohan Verma",
    email: "rohan@school.com",
    class: "Grade 10A",
    enrolled: "Sep 1, 2024",
    attendance: 88,
    assessments: [
      { title: "Quiz 1", date: "2024-09-15", score: 90, max: 100 },
      { title: "Midterm", date: "2024-10-01", score: 94, max: 100 },
      { title: "Quiz 2", date: "2024-10-15", score: 91, max: 100 },
      { title: "Assignment 1", date: "2024-10-20", score: 89, max: 100 }
    ],
    subjectScores: { Math: 92, Science: 94, English: 90, History: 88, Art: 85 }
  }
];

const subjectBarData = [
  { subject: "Math", avg: 86, highest: 95, lowest: 60 },
  { subject: "Science", avg: 82, highest: 94, lowest: 55 },
  { subject: "English", avg: 88, highest: 98, lowest: 60 },
  { subject: "History", avg: 78, highest: 89, lowest: 50 },
  { subject: "Art", avg: 76, highest: 90, lowest: 45 }
];

export default function TeacherDashboard() {
  const location = useLocation();
  if (location.state?.role !== "teacher") return <Navigate to="/not-allowed" />;

  const [students, setStudents] = useState(defaultStudents);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);
  const [tab, setTab] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [gradeInput, setGradeInput] = useState("Grade 10A");

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const scoreTrendData = selectedStudent.assessments.map((a) => ({
    name: a.title,
    score: a.score
  }));

  const getSuggestions = (subjectScores) => {
    const strengths = [];
    const improvements = [];
    for (const [sub, score] of Object.entries(subjectScores)) {
      if (score >= 75) strengths.push(sub);
      else improvements.push(sub);
    }
    return { strengths, improvements };
  };

  const handleAddStudent = () => {
    if (!nameInput || !emailInput) return alert("Enter name & email");

    const newStudent = {
      id: "s" + (students.length + 1),
      name: nameInput,
      email: emailInput,
      class: gradeInput,
      enrolled: new Date().toLocaleDateString(),
      attendance: 100,
      assessments: [{ title: "Quiz 1", date: "2024-10-25", score: 0, max: 100 }],
      subjectScores: { Math: 0, Science: 0, English: 0, History: 0, Art: 0 }
    };

    setStudents((p) => [...p, newStudent]);
    setAddOpen(false);
    setNameInput("");
    setEmailInput("");
  };

  return (
    <>
      <Navbar role="teacher" />

      <Box sx={{ p: { xs: 2, md: 6 } }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Students" />
          <Tab label="Performance" />
          <Tab label="Analytics" />
        </Tabs>

        {/* ---------------- Overview ---------------- */}
        {tab === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h5">About Student Performance Analytics</Typography>
            <Typography sx={{ mt: 2 }} color="text.secondary">
              This system allows teachers to analyze, track, and understand student performance
              across subjects using visual dashboards. Teachers can add students, review assessment
              trends, identify strengths and weaknesses, and monitor classroom progress.
            </Typography>
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Use the tabs above to manage students, evaluate their individual performance, and 
              view subject-level analytics.
            </Typography>
          </Paper>
        )}

        {/* ---------------- Students ---------------- */}
        {tab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Class Students</Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button variant="contained" onClick={() => setAddOpen(true)}>
                + Add Student
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Chip label={s.class} />
                    </TableCell>
                    <TableCell>{s.enrolled}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => { setSelectedStudentId(s.id); setTab(2); }}>
                        View Performance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* ---------------- Performance ---------------- */}
        {tab === 2 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudentId}
                  label="Select Student"
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} — {s.class}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6">{selectedStudent.name}</Typography>
              <Typography color="text.secondary">
                {selectedStudent.class} — {selectedStudent.email}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                Overall Grade: B+
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {/* Score Trend */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle1">Score Trend</Typography>

                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={scoreTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line dataKey="score" stroke="#7c3aed" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Breakdown */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle1">Assessment Breakdown</Typography>

                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={scoreTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#0f1724" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Strengths & Weaknesses */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Strengths</Typography>

                  {getSuggestions(selectedStudent.subjectScores).strengths.map((s) => (
                    <Chip key={s} label={s} color="success" sx={{ mr: 1, mt: 1 }} />
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Needs Improvement</Typography>

                  {getSuggestions(selectedStudent.subjectScores).improvements.map((s) => (
                    <Chip key={s} label={s} color="warning" sx={{ mr: 1, mt: 1 }} />
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ---------------- Analytics ---------------- */}
        {tab === 3 && (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6">Subject Analytics</Typography>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 360 }}>
                  <Typography variant="subtitle1">Overall Subject Performance</Typography>

                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={subjectBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avg" fill="#7c3aed" />
                      <Bar dataKey="highest" fill="#22c55e" />
                      <Bar dataKey="lowest" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Radar */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 360 }}>
                  <Typography variant="subtitle1">Strength Radar</Typography>

                  <ResponsiveContainer width="100%" height="85%">
                    <RadarChart data={subjectBarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar dataKey="avg" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Student</DialogTitle>
        <DialogContent sx={{ width: 420 }}>
          <TextField
            fullWidth
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={gradeInput}
              label="Class"
              onChange={(e) => setGradeInput(e.target.value)}
            >
              <MenuItem value="Grade 10A">Grade 10A</MenuItem>
              <MenuItem value="Grade 10B">Grade 10B</MenuItem>
              <MenuItem value="Grade 11A">Grade 11A</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStudent}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
