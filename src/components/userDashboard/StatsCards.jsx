import React from "react";
import { Card } from "../../components/Card";
import { BookOpen, CheckCircle, Video } from "lucide-react";

export default function StatsCards({ activeCoursesCount, completedCoursesCount, liveSessionsUpcomingCount }) {
  const stats = [
    { label: "Active Courses", value: activeCoursesCount, icon: <BookOpen className="w-6 h-6 text-teal-600" /> },
    { label: "Completed Courses", value: completedCoursesCount, icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
    { label: "Upcoming Live Sessions", value: liveSessionsUpcomingCount, icon: <Video className="w-6 h-6 text-yellow-600" /> },
  ];

  return (
    <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s, i) => (
        <Card
          key={i}
          className={`flex items-center gap-4 p-4 ${s.color}`}
        >
          <div className="flex-shrink-0">{s.icon}</div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-2xl font-semibold text-gray-800">{s.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
