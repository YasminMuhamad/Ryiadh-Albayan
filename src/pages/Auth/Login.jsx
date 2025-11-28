// pages/Auth/Login.jsx
import React, { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import AuthCard from "../../components/AuthCard";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import toast from "react-hot-toast";


const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");
  const [errors, setErrors] = useState({ email: "", pass: "" });

  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    let message = "";
    switch (name) {
      case "email":
        if (!value || !value.trim()) message = "Email is required";
        else if (!emailRegex.test(value.trim())) message = "Invalid email format";
        break;
      case "pass":
        if (!value || !value.trim()) message = "Password is required";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) validateField("email", e.target.value);
  };

  const handlePassChange = (e) => {
    setPass(e.target.value);
    if (errors.pass) validateField("pass", e.target.value);
  };

  const handleBlur = (field) => {
    if (field === "email") validateField("email", email);
    if (field === "pass") validateField("pass", pass);
  };

  const handleLogin = async () => {
    if (!validateField("email", email) || !validateField("pass", pass)) return;

    try {
      setLoading(true);
      const userData = await login(email.trim().toLowerCase(), pass, role);

      if (role === "teacher") {
        toast.success("Teacher login successful");
        navigate("/teacher/dashboard"); // ممكن تغيري لو عايزة
      } else {
        toast.success("Student login successful");
        navigate("/student/profile");
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.message || "Email or password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4 text-white text-xl">
            <BookOpen />
          </div>

          <h2 className="text-xl font-semibold">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to continue your learning journey</p>
        </div>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur("email")}
          className={`${errors.email ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={pass}
          onChange={handlePassChange}
          onBlur={() => handleBlur("pass")}
          className={`${errors.pass ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.pass && <p className="text-red-500 text-sm mb-2">{errors.pass}</p>}

        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === "student"}
              onChange={() => setRole("student")}
              className="form-radio"
            />
            Student
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="teacher"
              checked={role === "teacher"}
              onChange={() => setRole("teacher")}
              className="form-radio"
            />
            Teacher
          </label>
        </div>

        <Button
          className="btn-primary w-full mt-4"
          title={loading ? "Signing In..." : "Sign In"}
          onClick={handleLogin}
          disabled={loading}
        />

        <p className="text-center mt-3 text-sm">
          Don't have an account? <Link to="/register" className="text-[var(--primary)] font-medium">Sign up here</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
