import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Video, FileText, UserCircle, FileCheck } from "lucide-react";

const Sidebar = () => {
  const links = [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { to: "/teacher/students", label: "Students", icon: Users },
    { to: "/teacher/live", label: "Live Sessions", icon: Video },
    { to: "/teacher/Assignment", label: "Assignments", icon: FileCheck },
    { to: "/teacher/report", label: "Reports", icon: FileText },
    { to: "/teacher/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="w-60 min-h-screen bg-[var(--card)] border-r border-[var(--primary)] p-5 font-[Poppins]">
      <h1 className="text-xl font-bold text-[var(--primary)] mb-6">Teacher Panel</h1>

      <div className="flex flex-col gap-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] 
                transition ${
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }`
              }
            >
              <Icon className="w-5 h-5" /> {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
