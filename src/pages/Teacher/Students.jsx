import React, { useState } from "react";
import StudentDetailsPage from "./StudentDetails.jsx";
import Sidebar from "../../components/TeacherSidebar.jsx"; // <-- استيراد Sidebar

export default function StudentsPage() {
  const mockCourses = ["Mathematics", "Physics", "Chemistry"];
  const mockStudents = [
    {
      id: 1,
      name: "Ahmed Ali",
      email: "ahmed@example.com",
      enrolledCourses: ["Mathematics", "Physics"],
      progress: { "Mathematics": 70, "Physics": 50 },
      exams: {
        "Mathematics": [
          { title: "Math Test 1", answers: ["A", "B", "C", "D"], score: 70, solved: true },
          { title: "Math Test 2", answers: ["B", "A", "D", "C"], score: 80, solved: true },
        ],
        "Physics": [
          { title: "Physics Quiz 1", answers: ["True", "False", "True"], score: 50, solved: false },
        ],
      },
    },
    {
      id: 2,
      name: "Laila Mohamed",
      email: "layla@example.com",
      enrolledCourses: ["Chemistry"],
      progress: { "Chemistry": 80 },
      exams: {
        "Chemistry": [
          { title: "Chemistry Midterm", answers: ["C", "D", "A", "B"], score: 80, solved: true },
        ],
      },
    },
    {
      id: 3,
      name: "Omar Hassan",
      email: "omar@example.com",
      enrolledCourses: ["Mathematics", "Chemistry"],
      progress: { "Mathematics": 90, "Chemistry": 60 },
      exams: {},
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (selectedStudent) {
    return (
      <StudentDetailsPage
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      filterCourse === "all" || student.enrolledCourses.includes(filterCourse);
    return matchesSearch && matchesCourse;
  });

  const totalStudents = mockStudents.length;
  const newThisMonth = 2;
  const allProgress = mockStudents.flatMap((s) => Object.values(s.progress));
  const avgProgress =
    allProgress.length > 0
      ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length)
      : 0;

  const StatCard = ({ title, value }) => (
    <div className="bg-[var(--card)] shadow rounded-xl p-6 text-center">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );

  const StudentCard = ({ student }) => {
    const studentAvgProgress = Math.round(
      Object.values(student.progress).reduce((a, b) => a + b, 0) /
        Object.values(student.progress).length
    );

    return (
      <div className="bg-[var(--card)] border rounded-xl p-4 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[var(--primary)] text-white flex items-center justify-center rounded-full font-semibold">
            {student.name[0]}
          </div>
          <div>
            <h3 className="font-semibold">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <p className="text-sm">
            Courses: <span className="font-semibold">{student.enrolledCourses.length}</span>
          </p>
          <p className="text-sm">
            Avg Progress: <span className="font-semibold">{studentAvgProgress}%</span>
          </p>
          <button
            className="px-3 py-1 border rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
            onClick={() => setSelectedStudent(student)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-semibold heading-1">Students</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 border rounded-lg w-64 p-2"
            />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="all">All Courses</option>
              {mockCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={totalStudents} />
          <StatCard title="New This Month" value={newThisMonth} />
          <StatCard title="Average Progress" value={`${avgProgress}%`} />
        </div>

        {/* Students List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </div>
    </div>
  );
}
