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
    </button>
  );
}