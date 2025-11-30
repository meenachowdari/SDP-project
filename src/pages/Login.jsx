// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SAMPLE_DATA_KEY = "school_demo_init_done";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // initialize demo data once (teachers, students, admin)
  useEffect(() => {
    if (localStorage.getItem(SAMPLE_DATA_KEY)) return;

    const teachers = [
      { id: 1, name: "John Smith", email: "john@school.com", password: "123", subject: "Mathematics", classes: ["Grade 10A"] },
      { id: 2, name: "Emma Jones", email: "emma@school.com", password: "123", subject: "English", classes: ["Grade 10B"] }
    ];
    const students = [
      { id: "s1", name: "Varshini", email: "varshini@student.com", password: "123", class: "Grade 10A", attendance: 95, avg: 86 },
      { id: "s2", name: "Meena", email: "meena@student.com", password: "123", class: "Grade 10B", attendance: 92, avg: 82 }
    ];
    const admin = { email: "admin@school.com", password: "123" };

    localStorage.setItem("teachers", JSON.stringify(teachers));
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("admin", JSON.stringify(admin));
    localStorage.setItem(SAMPLE_DATA_KEY, "1");
  }, []);

  const handleLogin = () => {
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const students = JSON.parse(localStorage.getItem("students") || "[]");

    // admin
    if (admin && admin.email === email && admin.password === password) {
      navigate("/admin-dashboard", { state: { role: "admin" } });
      return;
    }

    // teacher
    const teacher = teachers.find((t) => t.email === email && t.password === password);
    if (teacher) {
      navigate("/teacher-dashboard", { state: { role: "teacher", email: teacher.email } });
      return;
    }

    // student
    const student = students.find((s) => s.email === email && s.password === password);
    if (student) {
      navigate("/student-dashboard", { state: { role: "student", email: student.email } });
      return;
    }

    alert("Invalid credentials. Try the demo users (any password '123'):\nadmin@school.com\njohn@school.com\nemma@school.com\nvarshini@student.com\nmeena@student.com");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f6f7fb" }}>
      <Paper sx={{ width: 420, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Student Performance Analytics</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in — demo environment (LocalStorage)
        </Typography>

        <TextField label="Email" fullWidth sx={{ mb: 2 }} value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button variant="contained" fullWidth onClick={handleLogin} sx={{ background: "#0f1724" }}>
          Sign In
        </Button>

        <Box textAlign="center" sx={{ mt: 2 }}>
          
        </Box>
      </Paper>
    </Box>
  );
}
