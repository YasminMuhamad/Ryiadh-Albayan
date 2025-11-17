import React from "react";
import TeacherSidebar from "./TeacherSidebar";
import Navbar from "./Navbar"; 

export default function TeacherLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
