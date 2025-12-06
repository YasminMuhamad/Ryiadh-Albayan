// pages/Auth/ForgotPassword.jsx
import React, { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import AuthCard from "../../components/AuthCard";
import { BookOpen } from "lucide-react";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      toast.success("Password reset email sent!");

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
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
          <h2 className="text-xl font-semibold">Forgot Password</h2>
          <p className="text-gray-600 mb-6">Enter your email to reset your password</p>
        </div>

        <label>Email</label>
        <input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-gray-300 px-3 py-2 mb-1 w-full"
        />

        <Button
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
