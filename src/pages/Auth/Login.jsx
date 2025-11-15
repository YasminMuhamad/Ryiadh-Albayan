import React, { useState } from "react";
import AuthLayout from "../../components/AuthLayout"
import AuthCard from "../../components/AuthCard";
import AuthInput from "../../components/AuthInput";
import PasswordInput from "../../components/PasswordInput";
import PrimaryButton from "../../components/PrimaryButton";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <AuthLayout>
      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4 text-white text-xl">
            <BookOpen/>
          </div>

          <h2 className="text-xl font-semibold">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Sign in to continue your learning journey</p>
        </div>

        <AuthInput
          label="Email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

       

        <PrimaryButton text="Sign In" onClick={() => alert("Login")} />

        <p className="text-center mt-3 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-[var(--primary)] font-medium">
            Sign up here
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
