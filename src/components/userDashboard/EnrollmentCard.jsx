import React from "react";
import { Button } from "../../components/Button";
import { Calendar, Clock, Video } from "lucide-react";
import { fmtDateOnly, fmtDateTime } from "../../utils/formatDate";
import { Card } from "../Card";
import { useNavigate } from "react-router-dom";

export default function EnrollmentCard({ enrollment, course }) {
  const percent = enrollment.percent ?? 0;
  const next = course?.nextSession ?? null;
  const statusLabelMap = {
    "completed": "Completed",
    "in-progress": "In Progress",
    "not-started": "Not Started"
  };
  const navigate = useNavigate();

  return (
    <Card className="relative p-4">
      {/* Container: column on mobile, row on md+ */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Status badge: static on mobile, absolute on md+ */}
        <div
          className={`self-start md:self-auto md:absolute md:top-4 md:right-4 px-2 py-1 text-xs font-semibold rounded-full 
            ${enrollment.status === "completed" ? "bg-[#0E7C7B] text-white" :
              enrollment.status === "in-progress" ? "bg-[#E9D8A6] text-black" :
                "bg-gray-300 text-black"}`}
        >
          {statusLabelMap[enrollment.status] || enrollment.status}
        </div>

        {/* Course thumbnail */}
        <img
          src={course.thumbnail || "/course-placeholder.png"}
          alt="thumb"
          className="
            w-full max-w-[220px] 
            aspect-square 
            object-cover 
            rounded-2xl 
            self-center 
            md:self-auto 
            md:w-36 md:h-36
          "
        />


        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-lg truncate">{course.title || enrollment.courseId}</div>
          <div className="text-sm text-gray-600 mt-1 truncate">
            {course.description
              ? (course.description.length > 120 ? course.description.slice(0, 120) + "..." : course.description)
              : "-"}
          </div>
          <div className="text-sm text-[#0E7C7B] mt-2">
            {course.teacherName ? `Instructor: ${course.teacherName}` : "Instructor: Unknown"}
          </div>

          {/* Next session (interactive) */}
          {course.type === "interactive" && next && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="whitespace-nowrap">
                  {typeof next.liveSession?.dateTime === "object" && next.liveSession.dateTime.toDate
                    ? fmtDateOnly(next.liveSession.dateTime)
                    : (next.liveAt ? new Date(next.liveAt).toLocaleDateString() : "")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="whitespace-nowrap">
                  {typeof next.liveSession?.dateTime === "object" && next.liveSession.dateTime.toDate
                    ? fmtDateTime(next.liveSession.dateTime).split(' ')[1]
                    : (next.liveAt ? new Date(next.liveAt).toLocaleTimeString() : "")}
                </span>
              </div>
            </div>
          )}

          {/* Progress / Attendance */}
          <div className="mt-3 text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">
                {course.type === "interactive" ? "Attendance Rate" : "Progress"}
              </span>
              <span className="text-xs text-[#0E7C7B]">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
              <div style={{ width: `${percent}%` }} className="h-2 bg-[#0E7C7B]" />
            </div>
          </div>

          {/* Action button: full width on mobile, auto on md+ */}
          <div className="mt-3">
            <Button
              className="btn-primary w-full md:w-auto py-2 px-4 text-sm"
              title={course.type === "interactive" ? "Join Session" : "Continue Learning"}
              icon={Video}
              onClick={() => {
                if (!course.id) {
                  // optional safety fallback
                  console.warn("No course id available for navigation", { enrollment, course });
                  return;
                }
                navigate(`/courses/${course.id}`); // <-- navigate to course page
              }} />
          </div>
        </div>
      </div>

      {/* Enrollment info: static block on mobile, absolute bottom-right on md+ */}
      <div className="mt-3 text-xs text-gray-400 space-y-1 md:absolute md:bottom-4 md:right-4 md:mt-0 text-left md:text-right">
        <div>Enrolled: {fmtDateOnly(enrollment.enrolledAt)}</div>
        <div>Lessons Completed: {enrollment.completedLessonsCount ?? (enrollment.completedLessons?.length ?? 0)}</div>
      </div>
    </Card>
  );
}
