import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="bg-[var(--card)] shadow-lg rounded-3xl p-10 w-full max-w-lg mx-auto">
      {children}
    </div>
  );
};

export default AuthCard;
