import React from "react";
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-[22px] border border-[#DBE9E5] shadow-sm p-5 my-1 transition-all duration-300 ease-in-out align-top ${className}`}>
      {children}
    </div>
  );
}