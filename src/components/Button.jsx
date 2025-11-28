import React from "react";

export function Button({ title, onClick, icon: Icon, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex  justify-center items-center  gap-2 px-4 py-2 rounded ${className} min-w-0`}
      title={title}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children || title}
    </button>
  );
}