// src/components/TopPerformingCard.jsx
import React from "react";
import { DashCard } from "./DashCard";

export default function TopPerformingCard({
  courses = [],
}) {
  return (
      <div className="space-y-3">
        {courses.map((c) => (
          <div key={c.name} className="flex items-center justify-between">
            <span className="text-sm">{c.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${c.value}%`, background: "#0E7C7B" }}
                />
              </div>
              <span className="text-sm">{c.value}%</span>
            </div>
          </div>
        ))}
      </div>
  );
}
