import React, { useState, useMemo, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

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
  Snackbar,
  Alert,
  Stack,
  Card,
  CardContent,
  CardActions,
  Divider
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

const defaultStudents = [
  {
    id: "24001",
    name: "Varshini",
    email: "Varshini@gmail.com",
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
    id: "24002",
    name: "Meena",
    email: "Meena@email.com",
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
    id: "24003",
    name: "Ankitha",
    email: "ankitha@gmail.com",
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


// ✅ new: always 5-digit, continues from the biggest existing ID
const generateStudentId = (students = []) => {
  const numericIds = students
    .map((s) => String(s.id || ""))
    .filter((id) => /^\d{5}$/.test(id))   // only proper 5-digit IDs
    .map((id) => parseInt(id, 10));

  // if no IDs yet, start at 24001 (you can change this base)
  const maxId = numericIds.length ? Math.max(...numericIds) : 24000;

  return String(maxId + 1).padStart(5, "0");
};


// normalize one student from DB so frontend always has id, assessments, subjectScores, etc
const normalizeStudent = (raw, fallbackIndex) => {
  const yearPrefix = new Date().getFullYear().toString().slice(-2);

  return {
    ...raw,
    // if DB didn’t store "id", create one on frontend
    id:
      raw.id ||
      raw.studentId ||
      (raw._id ? String(raw._id) : `${yearPrefix}${String(fallbackIndex + 1).padStart(3, "0")}`),
    assessments: Array.isArray(raw.assessments) ? raw.assessments : [],
    subjectScores:
      raw.subjectScores || {
        Math: 0,
        Science: 0,
        English: 0,
        History: 0,
        Art: 0
      },
    attendance: typeof raw.attendance === "number" ? raw.attendance : 0,
    enrolled: raw.enrolled || new Date().toLocaleDateString()
  };
};

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
  const [idInput, setIdInput] = useState("");

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [tab, setTab] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [gradeInput, setGradeInput] = useState("Grade 10A");
  const [mathInput, setMathInput] = useState("");
  const [scienceInput, setScienceInput] = useState("");
  const [englishInput, setEnglishInput] = useState("");
  const [historyInput, setHistoryInput] = useState("");
  const [artInput, setArtInput] = useState("");

  const [reportSnackOpen, setReportSnackOpen] = useState(false);
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);
  const [reportPreviewContent, setReportPreviewContent] = useState("");

  const [teacherSuggestions, setTeacherSuggestions] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("teacherSuggestions") || "{}");
    } catch (e) {
      return {};
    }
  });

  const [suggestionInput, setSuggestionInput] = useState("");

  // 🔹 Load from DB and ensure every student gets an id on frontend
  useEffect(() => {
    axios
      .get("http://localhost:5000/students")
      .then(async (res) => {
        if (res.data.length === 0) {
          // Seed DB with default students
          for (let st of defaultStudents) {
            await axios.post("http://localhost:5000/students", st);
          }
          setStudents(defaultStudents);
          setSelectedStudentId(defaultStudents[0].id);
        } else {
          const normalized = res.data.map((st, index) =>
            normalizeStudent(st, index)
          );
          setStudents(normalized);
          if (normalized.length) {
            setSelectedStudentId(normalized[0].id);
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);

  // ID shown in "Add Student" dialog
  const nextStudentId = generateStudentId(students);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const scoreTrendData = useMemo(() => {
    if (!selectedStudent || !Array.isArray(selectedStudent.assessments)) return [];
    return selectedStudent.assessments.map((a) => ({
      name: a.title,
      score: a.score
    }));
  }, [selectedStudent]);

  const assessmentBreakdown = scoreTrendData;

  const handleAddStudent = () => {
    if (!nameInput || !emailInput) {
      alert("Enter name and email");
      return;
    }

    if (
      !mathInput ||
      !scienceInput ||
      !englishInput ||
      !historyInput ||
      !artInput
    ) {
      alert("Enter marks for all subjects");
      return;
    }

    const newStudent = {
      id: generateStudentId(students),
      name: nameInput,
      email: emailInput,
      class: gradeInput,
      enrolled: new Date().toLocaleDateString(),
      attendance: 100,
      assessments: [
        {
          title: "Initial Assessment",
          date: new Date().toISOString().substring(0, 10),
          score: Math.round(
            (Number(mathInput) +
              Number(scienceInput) +
              Number(englishInput) +
              Number(historyInput) +
              Number(artInput)) / 5
          ),
          max: 100
        }
      ],
      subjectScores: {
        Math: Number(mathInput),
        Science: Number(scienceInput),
        English: Number(englishInput),
        History: Number(historyInput),
        Art: Number(artInput)
      }
    };

    // Save into MongoDB (endpoints unchanged)
    axios
      .post("http://localhost:5000/students", newStudent)
      .then((res) => {
        const created = res.data.student || newStudent;

        const normalized = normalizeStudent(created, students.length);

        setStudents((prev) => [...prev, normalized]);
        setSelectedStudentId(normalized.id);

        // reset form
        setAddOpen(false);
        setNameInput("");
        setEmailInput("");
        setMathInput("");
        setScienceInput("");
        setEnglishInput("");
        setHistoryInput("");
        setArtInput("");
      })
      .catch((err) => {
        console.error("Failed to save student:", err);
        alert("Error saving student to database");
      });
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Class",
      "Enrolled",
      "Attendance",
      "AvgScore"
    ];
    const rows = students.map((s) => {
      const avg =
        (Array.isArray(s.assessments) && s.assessments.length
          ? s.assessments.reduce((acc, a) => acc + a.score, 0) /
            s.assessments.length
          : 0) || 0;
      return [s.name, s.email, s.class, s.enrolled, s.attendance, Math.round(avg)];
    });

    let csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "class_export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  const handleGenerateReport = (type = "Class Summary") => {
    const content = `${type} generated for ${
      students.length
    } students.\nGenerated at: ${new Date().toLocaleString()}`;
    setReportPreviewContent(content);
    setReportPreviewOpen(true);
    setReportSnackOpen(true);
  };

  const handleAddTeacherSuggestion = () => {
    const text = suggestionInput.trim();
    if (!text || !selectedStudent) return;

    setTeacherSuggestions((prev) => {
      const updated = {
        ...prev,
        [selectedStudent.id]: [...(prev[selectedStudent.id] || []), text]
      };
      localStorage.setItem("teacherSuggestions", JSON.stringify(updated));
      return updated;
    });

    setSuggestionInput("");
  };

  const handlePreviewStudentReport = (student) => {
    if (!student) return;
    const avg = Math.round(
      (student.assessments &&
        student.assessments.reduce((a, b) => a + b.score, 0) /
          Math.max(1, student.assessments.length)) || 0
    );
    const strengths = Object.entries(student.subjectScores || {})
      .filter(([_, v]) => v >= 85)
      .map(([k]) => k);
    const weak = Object.entries(student.subjectScores || {})
      .filter(([_, v]) => v < 75)
      .map(([k]) => k);

    const content = `Report for ${student.name}\nClass: ${
      student.class
    }\nAvg Score: ${avg}\nAttendance: ${
      student.attendance
    }%\nStrengths: ${strengths.join(", ") || "None"}\nNeeds Improvement: ${
      weak.join(", ") || "None"
    }`;
    setReportPreviewContent(content);
    setReportPreviewOpen(true);
  };

  const getSuggestions = (subjectScores = {}) => {
    const strengths = [];
    const improvements = [];
    for (const [sub, score] of Object.entries(subjectScores)) {
      if (score >= 75) strengths.push(sub);
      else improvements.push(sub);
    }
    return { strengths, improvements };
  };

  const reportCards = [
    {
      id: "class",
      title: "Class Summary",
      desc: "Overall performance",
      action: () => handleGenerateReport("Class Summary")
    },
    {
      id: "individual",
      title: "Individual Reports",
      desc: "Per student report",
      action: () => handleGenerateReport("Individual Reports")
    },
    {
      id: "progress",
      title: "Progress Tracking",
      desc: "Track changes over time",
      action: () => handleGenerateReport("Progress Tracking")
    },
    {
      id: "export",
      title: "Data Export",
      desc: "Export CSV for class",
      action: handleExportCSV
    }
  ];

  const perSubjectData = {
    Math: [
      { name: "Quiz1", val: 78 },
      { name: "Quiz2", val: 82 },
      { name: "Midterm", val: 88 },
      { name: "Final", val: 90 }
    ],
    Science: [
      { name: "Lab1", val: 80 },
      { name: "Quiz", val: 85 },
      { name: "Midterm", val: 88 },
      { name: "Final", val: 91 }
    ],
    English: [
      { name: "Essay1", val: 84 },
      { name: "Quiz", val: 88 },
      { name: "Grammar Test", val: 86 },
      { name: "Final", val: 92 }
    ],
    History: [
      { name: "Quiz", val: 76 },
      { name: "Essay", val: 78 },
      { name: "Midterm", val: 79 },
      { name: "Final", val: 82 }
    ],
    Art: [
      { name: "Project", val: 82 },
      { name: "Presentation", val: 84 },
      { name: "Final", val: 85 },
      { name: "Showcase", val: 87 }
    ]
  };

  // if no students yet, avoid crashing in Performance tab
  const safeSelectedStudent = selectedStudent || {
    name: "",
    class: "",
    email: "",
    attendance: 0,
    assessments: [],
    subjectScores: {}
  };

  return (
    <>
      <Navbar role="teacher" />

      <Box sx={{ p: { xs: 2, md: 6 } }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          aria-label="teacher-tabs"
          sx={{ mb: 3 }}
        >
          <Tab label="Overview" />
          <Tab label="Students" />
          <Tab label="Performance" />
          <Tab label="Analytics" />
          <Tab label="Reports" />
          <Tab label="Attendance" />
        </Tabs>

        {/* ---------- Attendance Tab ---------- */}
        {tab === 5 && (
          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6">Mark Attendance</Typography>
              <Typography variant="body2" color="text.secondary">
                Record student attendance for today
              </Typography>
            </Paper>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Mark</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{s.enrolled}</TableCell>

                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={s.todayAttendance || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setStudents((prev) =>
                              prev.map((st) =>
                                st.id === s.id
                                  ? { ...st, todayAttendance: value }
                                  : st
                              )
                            );
                          }}
                        >
                          <MenuItem value="Present">Present</MenuItem>
                          <MenuItem value="Absent">Absent</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setStudents((prev) =>
                            prev.map((st) => {
                              if (st.id === s.id) {
                                const totalDays = st.totalDays
                                  ? st.totalDays + 1
                                  : 1;
                                const presentDays =
                                  st.presentDays
                                    ? st.presentDays +
                                      (st.todayAttendance === "Present" ? 1 : 0)
                                    : st.todayAttendance === "Present"
                                    ? 1
                                    : 0;
                                return {
                                  ...st,
                                  totalDays,
                                  presentDays,
                                  attendance: Math.round(
                                    (presentDays / totalDays) * 100
                                  )
                                };
                              }
                              return st;
                            })
                          );
                        }}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* ---------- Overview Tab ---------- */}
        {tab === 0 && (
          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6">Class Overview</Typography>
              <Typography variant="body2" color="text.secondary">
                Summary of students' performance and attendance
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {students.map((s) => {
                const avgScore = Math.round(
                  (Array.isArray(s.assessments) && s.assessments.length
                    ? s.assessments.reduce((a, b) => a + b.score, 0) /
                      s.assessments.length
                    : 0) || 0
                );
                return (
                  <Grid item xs={12} md={4} key={s.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1">{s.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.class}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {s.id}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          Average Score: <strong>{avgScore}%</strong>
                        </Typography>
                        <Typography variant="body2">
                          Attendance: <strong>{s.attendance}%</strong>
                        </Typography>
                      </CardContent>

                      <CardActions>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            setTab(2);
                          }}
                        >
                          View Performance
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handlePreviewStudentReport(s)}
                        >
                          Preview Report
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* ---------- Students Tab ---------- */}
        {tab === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6">Class Students</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Students in Grade 10A
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setIdInput(generateStudentId(students));  // prefill
                  setAddOpen(true);
                }}
              >
                + Add Student
              </Button>

            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Enrolled</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Chip label={s.class} />
                    </TableCell>
                    <TableCell>{s.enrolled}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setTab(2);
                        }}
                      >
                        View {s.id} — {s.name}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* ---------- Performance Tab ---------- */}
        {tab === 2 && (
          <Box>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 220 }}>
                  <FormControl fullWidth>
                    <InputLabel id="student-select-label">
                      Select Student
                    </InputLabel>
                    <Select
                      labelId="student-select-label"
                      value={selectedStudentId}
                      label="Select Student"
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                      {students.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.id} — {s.name} — {s.class}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                  <Typography variant="subtitle2">
                    Performance Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View detailed performance data for individual students
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Summary card */}
            <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">
                    {safeSelectedStudent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {safeSelectedStudent.class} — {safeSelectedStudent.email}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    Overall Grade: <strong>B+</strong>
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Score
                  </Typography>
                  <Typography variant="h6">
                    {Math.round(
                      (Array.isArray(safeSelectedStudent.assessments) &&
                      safeSelectedStudent.assessments.length
                        ? safeSelectedStudent.assessments.reduce(
                            (a, b) => a + b.score,
                            0
                          ) / safeSelectedStudent.assessments.length
                        : 0) || 0
                    )}
                    %
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Attendance
                  </Typography>
                  <Typography variant="h6">
                    {safeSelectedStudent.attendance}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Charts + details */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle1">Score Trend</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Performance over assessments
                  </Typography>

                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={scoreTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 320 }}>
                  <Typography variant="subtitle1">
                    Assessment Breakdown
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Scores by assessment type
                  </Typography>

                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={assessmentBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#0f1724" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Assessment details */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Assessment Details
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    {Array.isArray(safeSelectedStudent.assessments) &&
                      safeSelectedStudent.assessments.map((a, idx) => (
                        <Paper
                          key={idx}
                          sx={{
                            p: 2,
                            mb: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2">
                              {a.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {new Date(a.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2">
                              {a.score}/{a.max}
                            </Typography>
                            <Chip
                              label={`${Math.round(
                                (a.score / a.max) * 100
                              )}%`}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Paper>
                      ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Strengths & Improvements */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Strengths</Typography>
                  <Box sx={{ mt: 2 }}>
                    {getSuggestions(safeSelectedStudent.subjectScores)
                      .strengths.length > 0 ? (
                      getSuggestions(
                        safeSelectedStudent.subjectScores
                      ).strengths.map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          color="success"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No clear strengths yet
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Recommended Improvements
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {getSuggestions(safeSelectedStudent.subjectScores)
                      .improvements.length > 0 ? (
                      getSuggestions(
                        safeSelectedStudent.subjectScores
                      ).improvements.map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          color="warning"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No improvements needed
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Teacher Suggestions */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Teacher Suggestions / Comments
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Add personalized feedback that the student will see in their
                    dashboard.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mb: 2,
                      mt: 1,
                      flexDirection: { xs: "column", md: "row" }
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Write a suggestion for this student"
                      value={suggestionInput}
                      onChange={(e) => setSuggestionInput(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}
                      onClick={handleAddTeacherSuggestion}
                    >
                      Add Suggestion
                    </Button>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1}>
                    {(teacherSuggestions[safeSelectedStudent.id] || [])
                      .length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No suggestions yet. Add one above.
                      </Typography>
                    ) : (
                      teacherSuggestions[safeSelectedStudent.id].map(
                        (note, idx) => (
                          <Paper key={idx} sx={{ p: 1.5 }} variant="outlined">
                            <Typography variant="body2">{note}</Typography>
                          </Paper>
                        )
                      )
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ---------- Analytics Tab ---------- */}
        {tab === 3 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6">Subject Analytics</Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed subject-level performance across the class
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 360 }}>
                  <Typography variant="subtitle1">
                    Overall Subject Performance
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Average, highest and lowest marks by subject
                  </Typography>

                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={subjectBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avg" fill="#7c3aed" name="Average" />
                      <Bar dataKey="highest" fill="#00c48c" name="Highest" />
                      <Bar dataKey="lowest" fill="#ffb020" name="Lowest" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 360 }}>
                  <Typography variant="subtitle1">
                    Subject Strength Analysis
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Comparative performance across all subjects (radar)
                  </Typography>

                  <ResponsiveContainer width="100%" height="85%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={subjectBarData}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Average"
                        dataKey="avg"
                        stroke="#7c3aed"
                        fill="#7c3aed"
                        fillOpacity={0.6}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Progress Tracking Across Subjects
                  </Typography>

                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={[
                        {
                          month: "Sep",
                          Math: 78,
                          English: 82,
                          History: 75,
                          Science: 80,
                          Art: 74
                        },
                        {
                          month: "Oct",
                          Math: 80,
                          English: 84,
                          History: 77,
                          Science: 82,
                          Art: 76
                        },
                        {
                          month: "Nov",
                          Math: 82,
                          English: 86,
                          History: 78,
                          Science: 84,
                          Art: 78
                        },
                        {
                          month: "Dec",
                          Math: 84,
                          English: 88,
                          History: 80,
                          Science: 86,
                          Art: 80
                        },
                        {
                          month: "Jan",
                          Math: 86,
                          English: 90,
                          History: 82,
                          Science: 88,
                          Art: 82
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Math" stroke="#7c3aed" />
                      <Line
                        type="monotone"
                        dataKey="English"
                        stroke="#00c48c"
                      />
                      <Line
                        type="monotone"
                        dataKey="Science"
                        stroke="#ffb020"
                      />
                      <Line
                        type="monotone"
                        dataKey="History"
                        stroke="#ff6b6b"
                      />
                      <Line type="monotone" dataKey="Art" stroke="#4ecdc4" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {Object.keys(perSubjectData).map((sub) => (
                <Grid key={sub} item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: 200 }}>
                    <Typography variant="subtitle2">
                      {sub} - Assessment Marks
                    </Typography>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={perSubjectData[sub]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="val" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ---------- Reports Tab ---------- */}
        {tab === 4 && (
          <Box>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6">Generate Reports</Typography>
              <Typography variant="body2" color="text.secondary">
                Create comprehensive performance reports
              </Typography>
            </Paper>

            <Grid container spacing={3}>
              {reportCards.map((card) => (
                <Grid item xs={12} md={3} key={card.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.desc}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={card.action}
                      >
                        Generate
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setReportPreviewContent(`${card.title} preview`);
                          setReportPreviewOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Report Templates</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Quick access to common report formats
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleGenerateReport("Weekly Performance Report")
                        }
                      >
                        Generate
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setReportPreviewContent(
                            "Weekly Performance Preview"
                          );
                          setReportPreviewOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleGenerateReport(
                            "Parent Teacher Conference Report"
                          )
                        }
                      >
                        Generate
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setReportPreviewContent(
                            "Parent Teacher Conference Preview"
                          );
                          setReportPreviewOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleGenerateReport(
                            "Subject Performance Analysis"
                          )
                        }
                      >
                        Generate
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setReportPreviewContent(
                            "Subject Performance Analysis Preview"
                          );
                          setReportPreviewOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleGenerateReport("Class Comparison Report")
                        }
                      >
                        Generate
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setReportPreviewContent("Class Comparison Preview");
                          setReportPreviewOpen(true);
                        }}
                      >
                        Preview
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Export & Quick Actions
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Export raw data or generate quick summaries.
                  </Typography>

                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleExportCSV}>
                      Export CSV
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleGenerateReport("Quick Summary")
                      }
                    >
                      Generate Summary
                    </Button>
                  </Stack>
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
            label="Student ID"
            sx={{ mt: 1 }}
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />



          <TextField
            fullWidth
            label="Name"
            sx={{ mt: 2 }}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <TextField
            fullWidth
            label="Email"
            sx={{ mt: 2 }}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="grade-select-label">Class</InputLabel>
            <Select
              labelId="grade-select-label"
              value={gradeInput}
              label="Class"
              onChange={(e) => setGradeInput(e.target.value)}
            >
              <MenuItem value="Grade 10A">Grade 10A</MenuItem>
              <MenuItem value="Grade 10B">Grade 10B</MenuItem>
              <MenuItem value="Grade 11A">Grade 11A</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Math Marks"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={mathInput}
            onChange={(e) => setMathInput(e.target.value)}
          />
          <TextField
            label="Science Marks"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={scienceInput}
            onChange={(e) => setScienceInput(e.target.value)}
          />
          <TextField
            label="English Marks"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={englishInput}
            onChange={(e) => setEnglishInput(e.target.value)}
          />
          <TextField
            label="History Marks"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={historyInput}
            onChange={(e) => setHistoryInput(e.target.value)}
          />
          <TextField
            label="Art Marks"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={artInput}
            onChange={(e) => setArtInput(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStudent}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Preview */}
      <Dialog
        open={reportPreviewOpen}
        onClose={() => setReportPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          <Typography
            component="pre"
            sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
          >
            {reportPreviewContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportPreviewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReportPreviewOpen(false);
              setReportSnackOpen(true);
            }}
          >
            Save / Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={reportSnackOpen}
        autoHideDuration={2500}
        onClose={() => setReportSnackOpen(false)}
      >
        <Alert
          onClose={() => setReportSnackOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Report generated successfully.
        </Alert>
      </Snackbar>
    </>
  );
}
