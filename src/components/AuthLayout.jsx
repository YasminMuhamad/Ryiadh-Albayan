import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      {children}
    </div>
  );
};

export default AuthLayout;
