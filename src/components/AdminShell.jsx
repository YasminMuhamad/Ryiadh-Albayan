import React, { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount + resize
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024); // أقل من لابتوب
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

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

  // If screen is mobile → show message only
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <img
          src="/admin-desktop-only.png"
          alt="Desktop Only"
          className="w-40 mb-4 opacity-80"
        />
        <h2 className="text-xl font-semibold mb-2">Desktop Only</h2>
        <p className="text-gray-600 max-w-sm">
          The admin dashboard is not available on mobile devices.
          <br />
          Please use a desktop or laptop for the best experience.
        </p>
      </div>
    );
  }

  return (
    <>
      <Sidebar onNavigate={setActiveTab} />
      <Layout>
        {renderContent()}
      </Layout>
    </>
  );
}
