import React, { useState } from "react";

export default function StudentDetailsPage({ student, onBack }) {
  const [openCourse, setOpenCourse] = useState(null);
  const [openExam, setOpenExam] = useState(null);

  return (
    <div className="p-6 font-sans space-y-6">
      <button
        className="px-3 py-1 border rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
        onClick={onBack}
      >
        Back to Students
      </button>

      {/* Student Card */}
      <div className="bg-[var(--card)] rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="h-20 w-20 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
          {student.name[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{student.name}</h1>
          <p className="text-gray-500">{student.email}</p>
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-4">
        {student.enrolledCourses.map((course) => (
          <div key={course} className="bg-[var(--card)] rounded-xl shadow p-4">
            <button
              className="w-full text-left font-semibold text-lg flex justify-between items-center"
              onClick={() =>
                setOpenCourse(openCourse === course ? null : course)
              }
            >
              {course} <span>{openCourse === course ? "▲" : "▼"}</span>
            </button>

            {openCourse === course && (
              <ul className="mt-2 space-y-2">
                {student.exams[course]?.map((exam, idx) => (
                  <li
                    key={idx}
                    className="border rounded-md p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2"
                  >
                    <div>
                      <p className="font-semibold">{exam.title}</p>
                      <p className="text-sm text-gray-500">
                        Score: {exam.score ?? "Not graded"} |{" "}
                        {exam.solved ? "Solved" : "Not Solved"}
                      </p>
                    </div>
                    <button
                      className="mt-2 md:mt-0 px-3 py-1 border rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
                      onClick={() =>
                        setOpenExam(openExam === exam ? null : exam)
                      }
                    >
                      View Answers
                    </button>

                    {openExam === exam && (
                      <ul className="mt-2 ml-4 list-disc space-y-1">
                        {exam.answers.map((ans, i) => (
                          <li key={i}>{ans}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
