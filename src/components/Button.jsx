import React from 'react';

export function Button({ children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={`btn-primary ${className}`}
      style={{
        backgroundColor: 'var(--primary)',
        borderRadius: 'var(--radius)',
      }}
    >
      {children}
    </button>
  );
}