import React from "react";
import { Card } from "./Card";

export function Tab({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "recorded", title: "Recorded Courses" },
    { key: "interactive", title: "Interactive Courses" },
    { key: "progress", title: "Progress" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-2 px-2 py-1.5 font-medium rounded-full bg-[#E9D8A6]/20 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 font-medium rounded-full ${
              activeTab === tab.key ? "bg-white text-black" : "text-black"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "progress" && (
        <div className="flex gap-4 flex-wrap">
          {/* Attendance Card */}
          <Card className="h-[300px] w-[450px] p-4 space-y-4 flex-shrink-0">
            <div>
              <div className="text-l font-semibold text-muted-foreground">
                Attendance Record
              </div>
              <div className="text-md text-gray-600 mb-4">
                Your attendance in interactive sessions
              </div>
            </div>

            <div className="space-y-5">
              {[
                {
                  title: "Al-Ajrumiyyah - Arabic Grammar",
                  sessions: [1, 1, 0, 1, 1, 0],
                },
                {
                  title: "Quran Memorization Circle",
                  sessions: [1, 0, 1, 1, 1],
                },
              ].map((course, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-800">{course.title}</div>
                    <div className="text-sm text-[#0E7C7B]">
                      {course.sessions.filter((s) => s === 1).length}/{course.sessions.length} sessions
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {course.sessions.map((s, idx) => (
                      <div
                        key={idx}
                        className={`h-2 flex-1 rounded-xl border ${
                          s === 1
                            ? "bg-[#0E7C7B] border-[#0E7C7B]"
                            : "bg-[#F5F1E8] border-[#F5F1E8]"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Grades Card */}
          <Card className="h-[300px] w-[450px] p-4 space-y-4 flex-shrink-0">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Recent Grades
              </h3>
              <p className="text-md text-gray-600">
                Your performance in assignments and quizzes
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Quiz title",
                  course: "Tajweed Mastery - Complete Course",
                  score: 85,
                  date: "2024-05-15",
                },
                {
                  title: "Quiz title",
                  course: "Tajweed Mastery - Complete Course",
                  score: 90,
                  date: "2024-05-15",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#F5F1E8] p-4 rounded-xl flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray">{item.course}</p>
                  </div>

                  <div className="space-y-1 text-right">
                    <p className="text-sm text-gray-800">Score: {item.score}%</p>
                    <p className="text-sm text-[#0E7C7B]">Date: {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab !== "progress" && (
        <div className="p-4 text-gray-500"></div>
      )}
    </div>
  );
}
