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

const RegisterStudent = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!fullname || !cleanEmail || !pass || !confirmPass) {
      toast.error("Please fill all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Invalid email format");
      return;
    }

    if (pass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const userData = await register(fullname, cleanEmail, pass);
      toast.success("Account created successfully");

      if (userData.role === "admin") navigate("/admin/dashboard");
      else if (userData.role === "student") navigate("/student/profile");
      else navigate("/teacher");

    } catch (err) {
      toast.error(err.message || "Registration failed");
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

          <h2 className="text-xl font-semibold">Create an Account</h2>
          <p className="text-gray-600 mb-6">Join the learning platform now!</p>
        </div>

        <AuthInput label="Full Name" placeholder="Enter your full name" value={fullname} onChange={(e) => setFullname(e.target.value)} />
        <AuthInput label="Email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput label="Password" placeholder="Create your password" value={pass} onChange={(e) => setPass(e.target.value)} />
        <PasswordInput label="Confirm Password" placeholder="Confirm your password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />

        <PrimaryButton text={loading ? "Creating account..." : "Sign Up"} onClick={handleRegister} disabled={loading} />

        <p className="text-center mt-3 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--primary)] font-medium">Sign in here</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterStudent;
