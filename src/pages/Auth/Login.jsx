import React, { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import PasswordInput from "../../components/PasswordInput";
import PrimaryButton from "../../components/PrimaryButton";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !pass) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const userData = await login(email.trim().toLowerCase(), pass);
      toast.success("Signed in successfully");

      if (userData.role === "admin") navigate("/admin/dashboard");
      else if (userData.role === "student") navigate("/student/profile");
      else navigate("/teacher");

    } catch (err) {
      toast.error(err.message || "Login failed");
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

        <AuthInput label="Email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput label="Password" placeholder="Enter your password" value={pass} onChange={(e) => setPass(e.target.value)} />

        <PrimaryButton text={loading ? "Signing In..." : "Sign In"} onClick={handleLogin} disabled={loading} />

        <p className="text-center mt-3 text-sm">
          Don't have an account? <Link to="/register" className="text-[var(--primary)] font-medium">Sign up here</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
