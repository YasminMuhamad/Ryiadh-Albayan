import React, { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import AuthCard from "../../components/AuthCard";
import PasswordInput from "../../components/PasswordInput";
import { BookOpen } from "lucide-react";
import { Button } from "../../components/Button";
import { confirmPasswordReset, getAuth, verifyPasswordResetCode } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, updateDoc, getDocs, query, collection, where } from "firebase/firestore";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const queryParams = new URLSearchParams(window.location.search);
  const oobCode = queryParams.get("oobCode");
  const email = queryParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let message = "";
    switch (name) {
      case "newPassword":
        if (!value.trim()) message = "Password is required";
        break;
      case "confirmPassword":
        if (value !== newPassword) message = "Passwords do not match";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleBlur = (field) => {
    if (field === "newPassword") validateField("newPassword", newPassword);
    if (field === "confirmPassword") validateField("confirmPassword", confirmPassword);
  };

  const handleReset = async () => {
    if (!validateField("newPassword", newPassword) || !validateField("confirmPassword", confirmPassword)) return;

    try {
      setLoading(true);

      const authInstance = getAuth();
      const verifiedEmail = await verifyPasswordResetCode(authInstance, oobCode);

      await confirmPasswordReset(authInstance, oobCode, newPassword);

      if (verifiedEmail) {
        const q = query(
          collection(db, "teachers"),
          where("email", "==", verifiedEmail.trim().toLowerCase())
        );
        const snapshot = await getDocs(q);

        for (const docSnap of snapshot.docs) {
          await updateDoc(doc(db, "teachers", docSnap.id), { status: "Active" });
        }
      }

      toast.success("Password updated successfully!");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      toast.error("Error resetting password");
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
          <h2 className="text-xl font-semibold">Reset Your Password</h2>
          <p className="text-gray-600 mb-6">Enter your new password below</p>
        </div>

        <label>New Password</label>
        <PasswordInput
          placeholder="Enter your new password"
          value={newPassword}
          onChange={e => {
            const v = e.target.value;
            setNewPassword(v);
            validateField("newPassword", v);
            if (confirmPassword) validateField("confirmPassword", confirmPassword);
          }}
          onBlur={() => handleBlur("newPassword")}
          className={`${errors.newPassword ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.newPassword && <p className="text-red-500 text-sm mb-2">{errors.newPassword}</p>}

        <label>Confirm Password</label>
        <PasswordInput
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={e => {
            const v = e.target.value;
            setConfirmPassword(v);
            validateField("confirmPassword", v);
          }}
          onBlur={() => handleBlur("confirmPassword")}
          className={`${errors.confirmPassword ? "border-red-500 border-2" : "border border-gray-300"} px-3 py-2 mb-1 w-full`}
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mb-2">{errors.confirmPassword}</p>}

        <Button
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleReset}
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
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          {loading ? "Updating..." : "Reset Password"}
        </Button>

        <p className="text-center mt-3 text-sm">
          Remembered your password?{" "}
          <a href="/login" className="text-[var(--primary)] font-medium">
            Login here
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}