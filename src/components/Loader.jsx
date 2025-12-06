// src/components/Loader.jsx
import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-[#0E7C7B] rounded-full animate-spin"></div>
    </div>
  );
}
