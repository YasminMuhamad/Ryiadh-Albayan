import React, { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import AuthCard from "../../components/AuthCard";
import PasswordInput from "../../components/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Button";
import toast from "react-hot-toast";

const Register = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [errors, setErrors] = useState({ fullname: "", email: "", pass: "", confirmPass: "" });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    let message = "";
    switch (name) {
      case "fullname":
        if (!value.trim()) message = "Full name is required";
        break;
      case "email":
        if (!value.trim()) message = "Email is required";
        else if (!emailRegex.test(value.trim())) message = "Invalid email format";
        break;
      case "pass":
        if (!value.trim()) message = "Password is required";
        break;
      case "confirmPass":
        if (value !== pass) message = "Passwords do not match";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleBlur = (field) => {
    if (field === "fullname") validateField("fullname", fullname);
    if (field === "email") validateField("email", email);
    if (field === "pass") validateField("pass", pass);
    if (field === "confirmPass") validateField("confirmPass", confirmPass);
  };

  const handleRegister = async () => {
     if (loading) return;
     
    let hasError = false;
    if (!validateField("fullname", fullname)) hasError = true;
    if (!validateField("email", email)) hasError = true;
    if (!validateField("pass", pass)) hasError = true;
    if (!validateField("confirmPass", confirmPass)) hasError = true;
    if (hasError) return;

    setLoading(true);

    try {
      const userData = await register(fullname, email.trim().toLowerCase(), pass, "student");
      toast.success("Account created successfully!");
      navigate("/student/profile");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Try logging in.");
      } else {
        toast.error(err.message || "Registration failed!");
      }
      console.error("Registration failed:", err);
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

        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          onBlur={() => handleBlur("fullname")}
          className={`${errors.fullname ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.fullname && <p className="text-red-500 text-sm mb-2">{errors.fullname}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={e => {
            const v = e.target.value;
            setEmail(v);
            validateField("email", v); // validate as user types
          }}
          onBlur={() => handleBlur("email")}
          className={`${errors.email ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

        <label>Password</label>
        <PasswordInput
          placeholder="Enter your password"
          value={pass}
          onChange={(e) => {
            const v = e.target.value;
            setPass(v);
            validateField("pass", v);
            if (confirmPass) validateField("confirmPass", confirmPass);
          }}
          onBlur={() => handleBlur("pass")}
          className={`${errors.pass ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.pass && <p className="text-red-500 text-sm mb-2">{errors.pass}</p>}

        <label>Confirm Password</label>
        <PasswordInput
          placeholder="Confirm your password"
          value={confirmPass}
          onChange={e => {
            const v = e.target.value;
            setConfirmPass(v);
            validateField("confirmPass", v); // validate as user types
          }}
          onBlur={() => handleBlur("confirmPass")}
          className={`${errors.confirmPass ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.confirmPass && <p className="text-red-500 text-sm mb-2">{errors.confirmPass}</p>}

        <Button
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {loading ? "Creating account..." : "Sign Up"}
        </Button>

        <p className="text-center mt-3 text-sm">
          Already have an account? <Link to="/login" className="text-[var(--primary)] font-medium">Sign in here</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
