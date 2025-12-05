// src/components/AdminShell.jsx
import React, { useState } from 'react';
import '../styles/globals.css';
import { Sidebar } from './SideBar';
import { Layout } from './Layaout';
import AdminTeachers from '../pages/Admin/Teachers';
import AdminUsers from '../pages/Admin/Users';
import AdminAnalytics from '../pages/Admin/Analytics';
import AdminRevenue from '../pages/Admin/Revenue';
import AdminSettings from '../pages/Admin/Settings';
import { AdminDashboard } from '../pages/Admin/Dashboard';
import AdminCourses from '../pages/Admin/Courses';
import { CourseContent } from '../pages/Admin/CourseContent';

export function AdminShell({ userRole = 'admin' }) {
const [activeTab, setActiveTab] = useState('dashboard');
const [selectedCourseId, setSelectedCourseId] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'teachers': return <AdminTeachers />;
      case 'courses': return <AdminCourses setActiveTab={setActiveTab} setSelectedCourseId={setSelectedCourseId} />;
      case 'users': return <AdminUsers />;
      case 'analytics': return <AdminAnalytics />;
      case 'revenue': return <AdminRevenue />;
      case 'settings': return <AdminSettings />;
      case 'content' : return <CourseContent setActiveTab={setActiveTab} courseId={selectedCourseId}/>;
      default: return <AdminDashboard />;
    }
  };

  return (
    <>
    {/* <Sidebar /> */}
      <Sidebar onNavigate={setActiveTab} /> 
      <Layout>
        {renderContent()}
      </Layout>
    </>
  );
}