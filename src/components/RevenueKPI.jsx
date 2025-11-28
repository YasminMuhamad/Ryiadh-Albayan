// src/components/RevenueKPI.jsx
import React from "react";

export default function RevenueKPI({
  value,
  title,
  subtitle = "",
  Icon = null,
  iconBg = "#E6EFEB",
  iconColor = "#0E7C7B",
  className = "",
}) {
  return (
    <div
      className={`h-[120px] flex items-center justify-between px-4 ${className}`}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "22px",
        border: "1px solid #DBE9E5",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div>
        <p className="text-lg font-semibold">{value}</p>
        {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
      </div>

      <div
        className="w-12 h-12 flex items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        {Icon && <Icon className="text-2xl" style={{ color: iconColor }} />}
      </div>
    </div>
  );
}
