import React, { useState } from 'react';
import { Users, BarChart, DollarSign, BookOpen, CircleUser, ChartColumnIcon } from 'lucide-react';
import Title from './Title';

export function Sidebar({ userRole = 'admin', onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (onNavigate) onNavigate(tab);
  };

  const sidebarItemClasses = (tab) =>
    `flex items-center justify-start text-left px-3 py-2 mb-2 rounded-2xl text-sm cursor-pointer transition-colors duration-300
     ${activeTab === tab ? 'bg-teal-700 text-white' : 'text-gray-900 hover:bg-[#E9D8A6]'}`;

  return (
    <div className="w-60 h-[calc(100vh-60px)] fixed top-[60px] left-0 bg-white border-r border-gray-200 p-5 overflow-y-auto">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => handleNavigate('dashboard')}
          className={sidebarItemClasses('dashboard')}
        >
          <BarChart className="mr-3 text-lg" />
          <Title enTitle="Dashboard" arTitle="لوحة القيادة" />
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('teachers')}
          className={sidebarItemClasses('teachers')}
        >
          <CircleUser className="mr-3 text-lg" />
          <Title enTitle="Teachers Management" arTitle="إدارة المعلمين" />
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('courses')}
          className={sidebarItemClasses('courses')}
        >
          <BookOpen className="mr-3 text-lg" />
          <Title enTitle="Courses Management" arTitle="إدارة الدورات" />
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('users')}
          className={sidebarItemClasses('users')}
        >
          <Users className="mr-3 text-lg" />
          <Title enTitle="Users Management" arTitle="إدارة المستخدمين" />
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('analytics')}
          className={sidebarItemClasses('analytics')}
        >
          <ChartColumnIcon className="mr-3 text-lg" />
          <Title enTitle="Analytics & Statistics" arTitle="التحليلات والإحصائيات" />
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('revenue')}
          className={sidebarItemClasses('revenue')}
        >
          <DollarSign className="mr-3 text-lg" />
          <Title enTitle="Revenue Overview" arTitle="نظرة عامة على الإيرادات" />
        </button>
      </div>
    </div>
  );
}
