// src/components/Toast.jsx
import React, { useEffect } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-gray-500";

  return (
    <div className={`fixed top-5 right-5 px-4 py-2 text-white rounded-xl shadow-lg ${bgColor} animate-slide-in z-[9999]`}>
      {message}
    </div>
  );
}
