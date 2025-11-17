import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart, DollarSign, BookOpen, Settings } from 'lucide-react';
import "../styles/globals.css";

export function Sidebar({ userRole }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-links">
        <span
          onClick={() => handleNavigation('/teachers')}
          className="sidebar-item"
        >
          <Users className="sidebar-icon" />
          Teachers Management
        </span>

        <span
          onClick={() => handleNavigation('/courses')}
          className="sidebar-item"
        >
          <BookOpen className="sidebar-icon" />
          Courses Management
        </span>

        <span
          onClick={() => handleNavigation('/users')}
          className="sidebar-item"
        >
          <Users className="sidebar-icon" />
          Users Management
        </span>

        <span
          onClick={() => handleNavigation('/analytics')}
          className="sidebar-item"
        >
          <BarChart className="sidebar-icon" />
          Analytics & Statistics
        </span>

        <span
          onClick={() => handleNavigation('/revenue')}
          className="sidebar-item"
        >
          <DollarSign className="sidebar-icon" />
          Revenue Overview
        </span>

        {/* روابط الإعدادات تظهر للأدمن فقط */}
        {userRole === 'admin' && (
          <span
            onClick={() => handleNavigation('/settings')}
            className="sidebar-item"
          >
            <Settings className="sidebar-icon" />
            Settings
          </span>
        )}
      </div>
    </div>
  );
}