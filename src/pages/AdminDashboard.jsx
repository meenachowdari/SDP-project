import React, { useState, useMemo } from "react";
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
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import AdminNavbar from "../components/AdminNavbar";

const teachersData = [
  { id: 1, name: "John Smith", email: "john@school.com", subject: "Mathematics", class: "Grade 10A" },
  { id: 2, name: "Sarah Johnson", email: "sarah@school.com", subject: "English", class: "Grade 10B" },
  { id: 3, name: "Michael Brown", email: "michael@school.com", subject: "Science", class: "Grade 11A" },
];

const studentsData = [
  { id: "s1", name: "Emily Davis", class: "Grade 10A", avg: 86 },
  { id: "s2", name: "James Wilson", class: "Grade 10A", avg: 72 },
  { id: "s3", name: "Rohan Verma", class: "Grade 10A", avg: 91 },
  { id: "s4", name: "Sophia Patel", class: "Grade 10B", avg: 78 },
  { id: "s5", name: "Aarav Sharma", class: "Grade 10B", avg: 84 },
  { id: "s6", name: "Liam Carter", class: "Grade 11A", avg: 88 },
];

const examplePerformance = [
  { subject: "Math", avg: 86 },
  { subject: "Science", avg: 82 },
  { subject: "English", avg: 90 },
  { subject: "History", avg: 78 },
  { subject: "Art", avg: 75 },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState("");

  const studentPerformance = useMemo(() => {
    if (!selectedStudent) return [];
    return examplePerformance;
  }, [selectedStudent]);

  return (
    <>
      <AdminNavbar />

      <Box sx={{ p: { xs: 2, md: 5 } }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back, Admin User
        </Typography>

        {/* Overview cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2">Total Teachers</Typography>
              <Typography variant="h4">{teachersData.length}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2">Total Students</Typography>
              <Typography variant="h4">{studentsData.length}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2">Average Attendance</Typography>
              <Typography variant="h4">94%</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Teachers" />
          <Tab label="Students" />
          <Tab label="Performance Overview" />
        </Tabs>

        {/* TEACHERS TAB */}
        {tab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>All Teachers</Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Class</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {teachersData.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell><Chip label={t.subject} /></TableCell>
                    <TableCell>{t.class}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* STUDENTS TAB */}
        {tab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>All Students</Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Average Score</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {studentsData.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{s.avg}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* PERFORMANCE OVERVIEW TAB */}
        {tab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Performance Analysis</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a student to view detailed performance data
            </Typography>

            <Box sx={{ mb: 3, width: 350 }}>
              <FormControl fullWidth>
                <InputLabel>Select a student</InputLabel>
                <Select
                  label="Select a student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {studentsData.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} — {s.class}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {!selectedStudent ? (
              <Typography color="text.secondary">
                No student selected.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {/* Bar Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 350 }}>
                    <Typography>Average Marks</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={studentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avg" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                {/* Line Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: 350 }}>
                    <Typography>Performance Trend</Typography>
                    <ResponsiveContainer width="100%" height="85%">
                      <LineChart data={studentPerformance}>
                        <XAxis dataKey="subject" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg" stroke="#1e3a8a" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Paper>
        )}
      </Box>
    </>
  );
}
