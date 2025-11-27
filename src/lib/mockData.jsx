// src/lib/mockData.jsx
import { Users, Video, BookOpen, FileQuestion } from "lucide-react";

// ----------------- KPI Data -----------------
// بيانات كاردات KPI لكل نوع
export const kpiDetailsMock = {
  students: [
    { id: 1, name: "Ali Ahmed", email: "ali@example.com", status: "Active" },
    { id: 2, name: "Sara Omar", email: "sara@example.com", status: "Inactive" },
  ],
  courses: [
    { id: 1, title: "Arabic Basics", students: 25 },
    { id: 2, title: "Islamic Studies", students: 30 },
  ],
  live: [
    { id: 1, title: "Arabic Alphabet", time: "4:00 PM", duration: "60 mins" },
    { id: 2, title: "Fiqh Discussion", time: "2:00 PM", duration: "90 mins" },
  ],
};

export const kpiData = [
  {
    title: "Students",
    value: 120,
    icon: <Users className="h-6 w-6 text-[var(--primary)]" />,
    trend: { value: 5, isPositive: true },
    type: "students",
  },
  {
    title: "Live Sessions",
    value: 8,
    icon: <Video className="h-6 w-6 text-[var(--secondary)]" />,
    trend: { value: -1, isPositive: false },
    type: "live",
  },
  {
    title: "Quizzes Completed",
    value: 32,
    icon: <FileQuestion className="h-6 w-6 text-[var(--success)]" />,
    trend: { value: 3, isPositive: true },
    type: "quizzes",
  },
];

// ----------------- Recent Activities -----------------
export const mockActivities = [
  {
    id: 1,
    type: "session_scheduled",
    title: "New Live Session Scheduled",
    description: "Live session on 'Arabic Alphabet Basics' scheduled for today.",
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2h ago
  },
  {
    id: 2,
    type: "quiz_added",
    title: "Quiz Added",
    description: "A new quiz was added to 'Basic Grammar' course.",
    timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5h ago
  },
  {
    id: 3,
    type: "lesson_uploaded",
    title: "Lesson Uploaded",
    description: "Lesson 'Introduction to Tajweed' uploaded.",
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // yesterday
  },
  {
    id: 4,
    type: "announcement",
    title: "New Announcement",
    description: "Announcement posted for all students.",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
  },
];

// ----------------- Quick Action Strings -----------------
export const uiStrings = {
  dashboard: {
    welcomeBack: "Welcome Back",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    createCourse: "Create Course",
    scheduleLive: "Schedule Live",
    addAnnouncement: "Add Announcement",
    addQuiz: "Add Quiz",
    viewAll: "View All",
  },
};

// ----------------- Upcoming Live Sessions -----------------
export const upcomingSessions = [
  {
    id: 1,
    title: "Arabic Alphabet Basics",
    date: "Today 4:00 PM",
    duration: "60 mins",
    status: "In 2 hours",
  },
  {
    id: 2,
    title: "Fiqh Discussion",
    date: "Tomorrow 2:00 PM",
    duration: "90 mins",
    status: "Tomorrow",
  },
  {
    id: 3,
    title: "Tajweed Rules",
    date: "Nov 26, 6:00 PM",
    duration: "75 mins",
    status: "In 2 days",
  },
];
