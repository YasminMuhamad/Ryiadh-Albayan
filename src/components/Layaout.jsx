// src/components/Layaout.jsx
import React from 'react';

export function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ marginLeft: '250px', padding: '20px', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}