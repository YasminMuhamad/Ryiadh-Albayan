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
    setErrors(prev => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleLogin = async () => {
    if (!validateField("email", email) || !validateField("pass", pass)) return;

    try {
      setLoading(true);
      const res = await login(email.trim().toLowerCase(), pass); // returns { role, profile, uid }
      const role = res.role;

      if (role === "teacher") {
        toast.success("Teacher login successful");
        navigate("/teacher/dashboard");
      } else if (role === "admin") {
        toast.success("Admin login successful");
        navigate("/admin/dashboard");
      } else {
        toast.success("Student login successful");
        navigate("/student/dashboard");
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
          onBlur={() => validateField("email", email)}
          onChange={e => {
            const v = e.target.value;
            setEmail(v);
            validateField("email", v); // validate as user types
          }}
          className={`${errors.email ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          value={pass}
          onBlur={() => validateField("pass", pass)}
          onChange={e => setPass(e.target.value)}
          className={`${errors.pass ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.pass && <p className="text-red-500 text-sm mb-2">{errors.pass}</p>}

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
