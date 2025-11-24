// src/components/Sidebar.jsx
import React from 'react';
import { Users, BarChart, DollarSign, BookOpen, Settings } from 'lucide-react';
import "../styles/globals.css";

export function Sidebar({ userRole = 'admin', onNavigate }) {
  // onNavigate: function expected (e.g. setActiveTab)

  return (
    <div className="sidebar">
      <div className="sidebar-links">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="sidebar-item"
        >
          <BarChart className="sidebar-icon" />
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => onNavigate('teachers')}
          className="sidebar-item"
        >
          <Users className="sidebar-icon" />
          Teachers Management
        </button>

        <button
          type="button"
          onClick={() => onNavigate('courses')}
          className="sidebar-item"
        >
          <BookOpen className="sidebar-icon" />
          Courses Management
        </button>

        <button
          type="button"
          onClick={() => onNavigate('users')}
          className="sidebar-item"
        >
          <Users className="sidebar-icon" />
          Users Management
        </button>

        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="sidebar-item"
        >
          <BarChart className="sidebar-icon" />
          Analytics & Statistics
        </button>

        <button
          type="button"
          onClick={() => onNavigate('revenue')}
          className="sidebar-item"
        >
          <DollarSign className="sidebar-icon" />
          Revenue Overview
        </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="sidebar-item"
          >
            <Settings className="sidebar-icon" />
            Settings
          </button>
      </div>
    </div>
  );
}
