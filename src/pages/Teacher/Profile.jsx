import React, { useContext } from "react";
import { TeacherContext } from "../../context/TeacherContext";
import Sidebar from "../../components/TeacherSidebar.jsx";

export default function Profile() {
  const { teacher } = useContext(TeacherContext);

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading teacher data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6 font-sans">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Profile</h1>

        <div className="flex flex-col md:flex-row items-center gap-6 bg-[var(--card)] p-6 rounded-xl shadow">
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="w-32 h-32 rounded-full object-cover border-2 border-[var(--primary)]"
          />

          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              {teacher.name} ({teacher.nameAr})
            </h2>
            <p className="text-[var(--foreground)]/70">Email: {teacher.email}</p>
            <p className="text-[var(--foreground)]/70">Status: {teacher.status}</p>
            <p className="text-[var(--foreground)]/70">Specialization: {teacher.bio}</p>
            <p className="text-[var(--foreground)]/70">
              Courses Count: {teacher.coursesCount}
            </p>
            <p className="text-[var(--foreground)]/70">
              Joined: {new Date(teacher.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* إضافة أي أقسام إضافية ممكنة */}
      </div>
    </div>
  );
}
