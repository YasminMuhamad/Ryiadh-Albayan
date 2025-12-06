import React from "react";

// ===== Card =====
export function Card({ className = "", children, ...props }) {
  return <div className={`bg-white text-gray-900 flex flex-col gap-4 rounded-xl border shadow-sm ${className}`} {...props}>{children}</div>;
}
export function CardHeader({ className = "", children, ...props }) {
  return <div className={`px-6 pt-6 flex justify-between items-center ${className}`} {...props}>{children}</div>;
}
export function CardContent({ className = "", children, ...props }) {
  return <div className={`px-6 pb-6 ${className}`} {...props}>{children}</div>;
}
export function CardTitle({ className = "", children, ...props }) {
  return <h4 className={`text-lg font-semibold leading-none ${className}`} {...props}>{children}</h4>;
}

// ===== Button =====
export function Button({ className = "", variant = "default", size = "default", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none";
  const variantClasses = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border bg-white text-gray-900 hover:bg-gray-100",
    ghost: "hover:bg-gray-100",
  };
  const sizeClasses = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3",
    lg: "h-10 px-6",
  };
  return <button className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props} />;
}

// ===== Badge =====
export function Badge({ className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium";
  const variantClasses = {
    default: "bg-blue-500 text-white",
    outline: "border bg-white text-gray-900",
  };
  return <span className={`${base} ${variantClasses[variant] || ""} ${className}`} {...props} />;
}
