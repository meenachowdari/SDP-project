// src/pages/AdminDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
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
  TextField,
  Button,
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

  // load from localStorage
  const [teachersData, setTeachersData] = useState(() => JSON.parse(localStorage.getItem("teachers") || "[]"));
  const [studentsData, setStudentsData] = useState(() => JSON.parse(localStorage.getItem("students") || "[]"));

  // form states
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "", subject: "", classesText: "" });
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "", class: "", avg: "" });
  const [mapping, setMapping] = useState({ studentId: "", teacherId: "" });

  // persist whenever teachersData or studentsData changes
  useEffect(() => {
    localStorage.setItem("teachers", JSON.stringify(teachersData));
  }, [teachersData]);
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(studentsData));
  }, [studentsData]);

  const studentPerformance = useMemo(() => {
    if (!selectedStudent) return [];
    return examplePerformance;
  }, [selectedStudent]);

  // Add teacher
  const addTeacher = () => {
    if (!newTeacher.email || !newTeacher.password || !newTeacher.name) {
      alert("Enter teacher name, email and password");
      return;
    }
    const id = (teachersData.length ? Math.max(...teachersData.map(t => t.id)) + 1 : 1);
    const classes = newTeacher.classesText ? newTeacher.classesText.split(",").map(c => c.trim()) : [];
    const teacherObj = { id, name: newTeacher.name, email: newTeacher.email, password: newTeacher.password, subject: newTeacher.subject, classes };
    setTeachersData((p) => [...p, teacherObj]);
    setNewTeacher({ name: "", email: "", password: "", subject: "", classesText: "" });
  };

  // Add student
  const addStudent = () => {
    if (!newStudent.email || !newStudent.password || !newStudent.name) {
      alert("Enter student name, email and password");
      return;
    }
    const id = "s" + (studentsData.length + 1);
    const studentObj = { id, name: newStudent.name, email: newStudent.email, password: newStudent.password, class: newStudent.class, avg: Number(newStudent.avg) || 0, attendance: 0 };
    setStudentsData((p) => [...p, studentObj]);
    setNewStudent({ name: "", email: "", password: "", class: "", avg: "" });
  };

  // Map student to teacher (assign student's class to teacher class; also add class to teacher.classes if missing)
  const mapStudentToTeacher = () => {
    if (!mapping.studentId || !mapping.teacherId) {
      alert("Select both student and teacher");
      return;
    }
    // find teacher and student
    const tIdx = teachersData.findIndex(t => t.id === mapping.teacherId);
    const sIdx = studentsData.findIndex(s => s.id === mapping.studentId);
    if (tIdx < 0 || sIdx < 0) return;

    // assign student's class to teacher's first class (or add)
    const teacher = { ...teachersData[tIdx] };
    const student = { ...studentsData[sIdx] };

    // Option chosen: map student.class to teacher.classes (teacher will adopt that class if not present)
    if (!teacher.classes) teacher.classes = [];
    if (!teacher.classes.includes(student.class)) teacher.classes.push(student.class);

    const newTeachers = [...teachersData];
    newTeachers[tIdx] = teacher;
    setTeachersData(newTeachers);

    // optionally ensure student.class stays as is (we do not change student's class here)
    setMapping({ studentId: "", teacherId: "" });
  };

  // utility: remove teacher or student (small admin action)
  const removeTeacher = (id) => {
    if (!window.confirm("Remove teacher?")) return;
    setTeachersData((p) => p.filter(t => t.id !== id));
  };
  const removeStudent = (id) => {
    if (!window.confirm("Remove student?")) return;
    setStudentsData((p) => p.filter(s => s.id !== id));
  };

  return (
    <>
      <AdminNavbar />
      <Box sx={{ p: { xs: 2, md: 5 } }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Manage teachers, students and mappings</Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}><Typography variant="subtitle2">Total Teachers</Typography><Typography variant="h4">{teachersData.length}</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}><Typography variant="subtitle2">Total Students</Typography><Typography variant="h4">{studentsData.length}</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 3 }}><Typography variant="subtitle2">Average Attendance</Typography><Typography variant="h4">--%</Typography></Paper></Grid>
        </Grid>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Teachers" />
          <Tab label="Students" />
          <Tab label="Performance Overview" />
          <Tab label="Add / Map" />
        </Tabs>

        {tab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>All Teachers</Typography>
            <Table>
              <TableHead>
                <TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Subject</TableCell><TableCell>Classes</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {teachersData.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell><Chip label={t.subject} /></TableCell>
                    <TableCell>{(t.classes || []).join(", ")}</TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => removeTeacher(t.id)}>Remove</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {tab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>All Students</Typography>
            <Table>
              <TableHead>
                <TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Class</TableCell><TableCell>Avg</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {studentsData.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{s.avg}%</TableCell>
                    <TableCell><Button size="small" color="error" onClick={() => removeStudent(s.id)}>Remove</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {tab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Performance Analysis</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Select a student to view detailed performance data</Typography>

            <Box sx={{ mb: 3, width: 350 }}>
              <FormControl fullWidth>
                <InputLabel>Select a student</InputLabel>
                <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  {studentsData.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} — {s.class}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>

            {!selectedStudent ? <Typography color="text.secondary">No student selected.</Typography> : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 350 }}><Typography>Average Marks</Typography><ResponsiveContainer width="100%" height="85%"><BarChart data={examplePerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="subject" /><YAxis /><Tooltip /><Bar dataKey="avg" fill="#8b5cf6" /></BarChart></ResponsiveContainer></Paper></Grid>
                <Grid item xs={12} md={6}><Paper sx={{ p: 2, height: 350 }}><Typography>Performance Trend</Typography><ResponsiveContainer width="100%" height="85%"><LineChart data={examplePerformance}><XAxis dataKey="subject" /><YAxis /><Tooltip /><Line type="monotone" dataKey="avg" stroke="#1e3a8a" strokeWidth={3} /></LineChart></ResponsiveContainer></Paper></Grid>
              </Grid>
            )}
          </Paper>
        )}

        {tab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Teacher</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><TextField label="Name" fullWidth value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Email" fullWidth value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField label="Password" fullWidth value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField label="Subject" fullWidth value={newTeacher.subject} onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField label="Classes (comma)" fullWidth value={newTeacher.classesText} onChange={(e) => setNewTeacher({ ...newTeacher, classesText: e.target.value })} /></Grid>
              <Grid item xs={12} md={12}><Button variant="contained" onClick={addTeacher}>Add Teacher</Button></Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2 }}>Add Student</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}><TextField label="Name" fullWidth value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Email" fullWidth value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField label="Password" fullWidth value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField label="Class" fullWidth value={newStudent.class} onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })} /></Grid>
              <Grid item xs={12} md={2}><TextField label="Avg" fullWidth value={newStudent.avg} onChange={(e) => setNewStudent({ ...newStudent, avg: e.target.value })} /></Grid>
              <Grid item xs={12} md={12}><Button variant="contained" onClick={addStudent}>Add Student</Button></Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2 }}>Map Student → Teacher (adds student class to teacher)</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Student</InputLabel>
                  <Select value={mapping.studentId} onChange={(e) => setMapping({ ...mapping, studentId: e.target.value })}>
                    <MenuItem value="">Select</MenuItem>
                    {studentsData.map(s => <MenuItem key={s.id} value={s.id}>{s.name} — {s.class}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Teacher</InputLabel>
                  <Select value={mapping.teacherId} onChange={(e) => setMapping({ ...mapping, teacherId: e.target.value })}>
                    <MenuItem value="">Select</MenuItem>
                    {teachersData.map(t => <MenuItem key={t.id} value={t.id}>{t.name} — {(t.classes||[]).join(", ")}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}><Button variant="contained" onClick={mapStudentToTeacher}>Map</Button></Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </>
  );
}
