import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/teacher", label: "Dashboard"},
  { to: "/teacher/courses", label: "Courses"},
  { to: "/teacher/live", label: "Live Sessions"},
  { to: "/teacher/assignments", label: "Assignments",},
  { to: "/teacher/students", label: "Students"},
  { to: "/teacher/reports", label: "Reports",},
  { to: "/teacher/profile", label: "Profile", },
];

export default function TeacherSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} bg-white shadow-sm border-r`} style={{ borderColor: "var(--border)" }}>
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[var(--primary)] text-white flex items-center justify-center font-semibold">RB</div>
          {!collapsed && <div className="font-semibold">Riyadh Al-Bayan</div>}
        </div>
        <button aria-label="Toggle sidebar" onClick={()=>setCollapsed(!collapsed)} className="text-sm opacity-70">
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="mt-4">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 hover:bg-[var(--card)] transition-colors ${isActive ? "bg-[var(--card)] border-l-4 border-[var(--primary)]" : ""}`
            }
          >
            <span className="text-xl">{it.icon}</span>
            <span className={`${collapsed ? "hidden" : "block"}`}>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <button className="w-full btn-primary" onClick={()=>alert("Switch role (preview)")}>Switch Role</button>
      </div>
    </aside>
  );
}
