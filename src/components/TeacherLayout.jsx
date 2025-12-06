import React from "react";
import { Sidebar } from "./TeacherSidebar.jsx";


export default function TeacherLayout({ children, userRole = "teacher" }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

