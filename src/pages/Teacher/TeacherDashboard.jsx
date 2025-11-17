import React from "react";
import { BookOpen, Video, Users, TrendingUp, Plus, Calendar, Bell, FileQuestion } from 'lucide-react';
import { KPICard } from "../../components/KPICard";
import { Card, CardHeader, CardContent, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { mockActivities, uiStrings } from "../../lib/mockData";

export default function Dashboard({ userName = "Teacher", onNavigate = () => {}, onOpenModal = () => {} }) {

  const getActivityIcon = (type) => {
    switch (type) {
      case 'session_scheduled': return <Calendar className="h-4 w-4 text-[var(--primary)]" />;
      case 'quiz_added': return <FileQuestion className="h-4 w-4 text-[var(--secondary)]" />;
      case 'lesson_uploaded': return <BookOpen className="h-4 w-4 text-[var(--success)]" />;
      case 'announcement': return <Bell className="h-4 w-4 text-[var(--warning)]" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)] mb-2">
            {uiStrings.dashboard?.welcomeBack || "Welcome Back"}, {userName}! 👋
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Here's what's happening with your courses today
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => onOpenModal('createCourse')}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            {uiStrings.dashboard?.createCourse || "Create Course"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Courses" value={4} icon={BookOpen} trend={{ value: 12.5, isPositive: true }} onClick={() => onNavigate('courses')} />
        <KPICard title="Live Sessions" value={2} icon={Video} trend={{ value: 8.3, isPositive: true }} onClick={() => onNavigate('live')} />
        <KPICard title="Students" value={105} icon={Users} trend={{ value: 15.2, isPositive: true }} onClick={() => onNavigate('students')} />
        <KPICard title="Attendance Rate" value="87%" icon={TrendingUp} trend={{ value: 3.1, isPositive: true }} onClick={() => onNavigate('reports')} />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>{uiStrings.dashboard?.recentActivity || "Recent Activity"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('courses')} className="text-[var(--primary)]">
              {uiStrings.dashboard?.viewAll || "View All"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-[var(--accent)] transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] mb-1">{activity.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">{activity.description}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-shadow islamic-pattern-subtle">
          <CardHeader>
            <CardTitle>{uiStrings.dashboard?.quickActions || "Quick Actions"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => onOpenModal('createCourse')} variant="outline" className="w-full justify-start gap-3 py-4 hover:bg-[var(--accent)] hover:border-[var(--primary)]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">{uiStrings.dashboard?.createCourse || "Create Course"}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Start a new course</p>
              </div>
            </Button>
            <Button onClick={() => onOpenModal('scheduleLive')} variant="outline" className="w-full justify-start gap-3 py-4 hover:bg-[var(--accent)] hover:border-[var(--primary)]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">{uiStrings.dashboard?.scheduleLive || "Schedule Live"}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Schedule a live session</p>
              </div>
            </Button>
            <Button onClick={() => onOpenModal('addAnnouncement')} variant="outline" className="w-full justify-start gap-3 py-4 hover:bg-[var(--accent)] hover:border-[var(--primary)]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">{uiStrings.dashboard?.addAnnouncement || "Add Announcement"}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Post to your courses</p>
              </div>
            </Button>
            <Button onClick={() => onOpenModal('addQuiz')} variant="outline" className="w-full justify-start gap-3 py-4 hover:bg-[var(--accent)] hover:border-[var(--primary)]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">{uiStrings.dashboard?.addQuiz || "Add Quiz"}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Create an assessment</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card className="card-shadow">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Upcoming Live Sessions</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('live')} className="text-[var(--primary)]">
            View All →
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                <Video className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium">Introduction to Arabic Alphabet</p>
                <p className="text-sm text-[var(--muted-foreground)]">Today at 4:00 PM • 60 minutes</p>
              </div>
            </div>
            <Badge className="bg-[var(--secondary)] text-[var(--foreground)]">In 2 hours</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)] bg-opacity-10 flex items-center justify-center">
                <Video className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium">Fiqh Discussion - Prayer Rulings</p>
                <p className="text-sm text-[var(--muted-foreground)]">Tomorrow at 2:00 PM • 90 minutes</p>
              </div>
            </div>
            <Badge variant="outline">Tomorrow</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
