import React from "react";
import { Card } from "../../components/Card";
import { fmt } from "../../utils/formatDate";
import { Clock } from "lucide-react";

export default function LiveSessionsCard({ sessions }) {
  return (
    <Card className="p-6">
      <h3 className="font-medium text-gray-800text-l font-semibold text-muted-foreground">Upcoming Live Sessions</h3>
      <p className="text-md text-gray-600 mb-4">
        Keep track of your upcoming live classes and join on time
      </p>

      <div className="space-y-3">
        {sessions.length === 0 && (
          <div className="text-center text-gray-400 py-6">No upcoming live sessions.</div>
        )}

        {sessions.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 p-3 rounded-xl border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-800">{s.courseTitle}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                {fmt(s.liveSession.dateTime)}
              </div>
            </div>
            <div className="text-sm text-gray-600">{s.lessonTitle}</div>
            <div className="text-xs text-gray-400">Instructor: {s.teacherName}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
