import React from "react";
import { Card } from "../../components/Card";

export function AttendanceCard({ data }) {
  const allSessions = data.flatMap((c) => c.sessions || []);

  const attendedCount = allSessions.filter(
    (s) => s.status === "attended"
  ).length;

  const absentCount = allSessions.filter(
    (s) => s.status === "absent"
  ).length;

  return (
    <Card className="flex-1 w-1/2 p-4 flex flex-col justify-between">
      {/* محتوى الكارد */}
      <div className="space-y-5">
        <div>
          <div className="text-l font-semibold text-muted-foreground">Attendance Record</div>
          <div className="text-md text-gray-600 mb-4">Your attendance in interactive sessions</div>
        </div>

        {data.length === 0 && (
          <div className="text-sm text-muted-foreground">No attendance data available.</div>
        )}

        {data.map((course, i) => (
          <div key={course.courseId || i}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-800">{course.title}</div>
              <div className="text-sm text-[#0E7C7B]">
                {course.sessions.filter((s) => s.status === "attended").length}
                /{course.sessions.filter(s => s.status !== "cancelled").length} sessions
              </div>
            </div>

            <div className="flex gap-1">
              {course.sessions
                // .filter(s => s.status !== "cancelled") // تجاهل الملغيات
                .map((s, idx) => {
                  const attended = s.status === "attended";
                  return (
                    <div
                      key={s.lessonId || idx}
                      title={`${s.title || "Session"} — ${s.date ? new Date(s.date).toLocaleDateString() : ""}`}
                      className={`h-2 flex-1 rounded-xl border ${attended
                        ? "bg-[#0E7C7B] border-[#0E7C7B]"
                        : "bg-[#F5F1E8] border-[#F5F1E8]"
                        }`}
                    />
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* ---- footer summary ---- */}
      <div className="pt-4 mt-6 border-t border-gray-200 flex justify-between text-sm font-medium">
        <div className="text-[#0E7C7B]">Attended: {attendedCount}</div>
        <div className="text-red-500">Absent: {absentCount}</div>
      </div>
    </Card>
  );
}

export function GradesCard({ data }) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex-1 w-1/2 p-4 space-y-4">
        <div className="text-sm text-muted-foreground">No grades available yet.</div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 w-1/2 p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-l font-semibold text-muted-foreground">Recent Grades</h3>
        <p className="text-md text-gray-600 mb-4">Your performance in assignments and quizzes</p>
      </div>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="bg-[#F5F1E8] p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">{item.course}</p>
            </div>
            <div className="space-y-1 text-right">
              {item.status === "notSubmitted" ? (
                <p className="text-sm text-red-600 font-semibold">Not Submitted</p>
              ) : (
                <p className="text-sm text-[#0E7C7B]">Score: {item.score ?? 0}</p>
              )}
              {/* <p className="text-sm text-gray-500">Date: {item.date || "—"}</p> */}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
