<<<<<<< HEAD
import React from 'react';

export function Button({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`btn-primary ${className}`}
      style={{
        backgroundColor: 'var(--primary)', // استخدام متغير الخلفية
        borderRadius: 'var(--radius)', // استخدام متغير ال radius
      }}
    >
      {children}
=======
import React from "react";

export function Button({ title, onClick, icon: Icon, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded ${className} min-w-0`}
      title={title}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children || title}
>>>>>>> origin/dev
    </button>
  );
}