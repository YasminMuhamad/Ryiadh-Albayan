// src/components/TopPerformingCard.jsx
import React from "react";

export default function TopPerformingCard({ courses = [] }) {
  if (!courses.length) return null;

  // نجيب أعلى قيمة كورس
  const maxValue = Math.max(...courses.map(c => c.value));

  return (
    <div className="space-y-3">
      {courses.map((c) => {
        // النسبة بالنسبة لأعلى كورس
        const percentage = maxValue ? ((c.value / maxValue) * 100).toFixed(1) : 0;
        return (
          <div key={c.name} className="flex items-center justify-between">
            <span className="text-sm">{c.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${percentage}%`, background: "#0E7C7B" }}
                />
              </div>
              <span className="text-sm">{percentage}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
