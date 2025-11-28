// src/components/Sidebar.jsx
import React from 'react';
import { Users, BarChart, DollarSign, BookOpen, Settings, CircleUser, ChartColumnIcon } from 'lucide-react';
import "../styles/globals.css";
import Title from './Title';

export function Sidebar({ userRole = 'admin', onNavigate }) {
  // onNavigate: function expected (e.g. setActiveTab)

  return (
    <div className="sidebar">
      <div className="sidebar-links">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="sidebar-item justify-start text-left"
        >
          <BarChart className="sidebar-icon" />
          <Title enTitle='Dashboard' arTitle='لوحة القيادة' />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('teachers')}
          className="sidebar-item justify-start text-left"
        >
          <CircleUser className="sidebar-icon" />
          <Title enTitle='Teachers Management' arTitle='إدارة المعلمين' />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('courses')}
          className="sidebar-item justify-start text-left"
        >
          <BookOpen className="sidebar-icon" />
          <Title enTitle='Courses Management' arTitle='إدارة الدورات' />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('users')}
          className="sidebar-item justify-start text-left"
        >
          <Users className="sidebar-icon" />
          <Title enTitle='Users Management' arTitle='إدارة المستخدمين' />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="sidebar-item justify-start text-left"
        >
          <ChartColumnIcon className="sidebar-icon" />
          <Title enTitle='Analytics & Statistics' arTitle='التحليلات والإحصائيات' />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('revenue')}
          className="sidebar-item justify-start text-left"
        >
          <DollarSign className="sidebar-icon" />
          <Title enTitle='Revenue Overview' arTitle='نظرة عامة على الإيرادات' />
        </button>

          {/* <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="sidebar-item justify-start text-left"
          >
            <Settings className="sidebar-icon" />
            Settings
          </button> */}
      </div>
    </div>
  );
}
