import { useState } from "react";
import Sidebar from "../../components/TeacherSidebar.jsx"; // ← استدعاء السايد بار

export default function AssignmentsPage() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  // ---------------- SVG Icons ---------------
  const icons = {
    folder: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M4 4h5l2 3h9a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
    file: (
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M7 3h6l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    ),
    user: (
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0v2H5v-2z" />
      </svg>
    ),
    score: (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          d="M12 8c-3 0-4 2-4 5h8c0-3-1-5-4-5z" />
      </svg>
    ),
  };

  // ---------------------- DATA ----------------------
  const subjects = [
    {
      id: "math",
      name: "Mathematics",
      exams: [
        {
          id: "math-midterm",
          title: "Midterm Exam",
          students: [
            { id: "301", name: "Ahmed Magdy", score: 18, total: 20 },
            { id: "302", name: "Sara Adel", score: 15, total: 20 },
            { id: "303", name: "Omar Ali", score: 20, total: 20 },
          ],
        },
        {
          id: "math-final",
          title: "Final Exam",
          students: [
            { id: "401", name: "Mostafa Hassan", score: 12, total: 20 },
            { id: "402", name: "Nour Ibrahim", score: 17, total: 20 },
          ],
        },
      ],
    },

    {
      id: "physics",
      name: "Physics",
      exams: [
        {
          id: "phy-quiz1",
          title: "Quiz 1",
          students: [
            { id: "201", name: "Mariam Hany", score: 8, total: 10 },
            { id: "202", name: "Youssef Reda", score: 9, total: 10 },
          ],
        },
      ],
    },

    {
      id: "english",
      name: "English",
      exams: [
        {
          id: "eng-writing",
          title: "Writing Test",
          students: [
            { id: "110", name: "Eman Khaled", score: 13, total: 15 },
            { id: "111", name: "Hossam Mohamed", score: 14, total: 15 },
            { id: "112", name: "Lara Samir", score: 15, total: 15 },
          ],
        },
        {
          id: "eng-oral",
          title: "Oral Exam",
          students: [{ id: "115", name: "John Peter", score: 9, total: 10 }],
        },
      ],
    },
  ];

  // ---------------------- RENDER ----------------------
  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* ---- SIDEBAR ---- */}
      <Sidebar />

      {/* ---- MAIN CONTENT ---- */}
      <div className="flex-1 p-6 space-y-6 font-sans">

        <h1 className="text-3xl font-bold">Assignments</h1>

        {/* SUBJECTS */}
        {!selectedSubject && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="p-5 border rounded-xl bg-[var(--card)] shadow cursor-pointer hover:shadow-lg transition"
                onClick={() => setSelectedSubject(subj.id)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{subj.name}</h2>
                  {icons.folder}
                </div>

                <p className="mt-2 text-[var(--muted-foreground)]">
                  {subj.exams.length} exams
                </p>
              </div>
            ))}
          </div>
        )}

        {/* EXAMS */}
        {selectedSubject && !selectedExam && (
          <div className="p-6 border rounded-xl bg-[var(--card)] shadow">
            <button className="underline mb-4" onClick={() => setSelectedSubject(null)}>
              ← Back to subjects
            </button>

            <h2 className="text-xl font-bold mb-4">
              Exams for {subjects.find((s) => s.id === selectedSubject)?.name}
            </h2>

            {subjects
              .find((s) => s.id === selectedSubject)
              .exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition mb-3 cursor-pointer"
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{exam.title}</h3>
                    {icons.file}
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {exam.students.length} students submitted
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* STUDENT LIST + SCORES */}
        {selectedExam && (
          <div className="p-6 border rounded-xl bg-[var(--card)] shadow">
            <button
              className="underline mb-4"
              onClick={() => setSelectedExam(null)}
            >
              ← Back to exams
            </button>

            <h2 className="text-xl font-bold mb-3">
              Students for exam:{" "}
              {subjects
                .flatMap((s) => s.exams)
                .find((e) => e.id === selectedExam)?.title}
            </h2>

            <div className="space-y-3">
              {subjects
                .flatMap((s) => s.exams)
                .find((e) => e.id === selectedExam)
                .students.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 bg-white rounded-lg border flex items-center justify-between shadow-sm"
                  >
                    {/* Left Side — Student Info */}
                    <div className="flex items-center gap-3">
                      {icons.user}
                      <div>
                        <p className="font-medium">{st.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">ID: {st.id}</p>
                      </div>
                    </div>

                    {/* Right Side — Score */}
                    <div className="flex items-center gap-2">
                      {icons.score}
                      <p className="font-semibold text-sm">
                        {st.score} / {st.total}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
