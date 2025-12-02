import React, { useState, useEffect, useContext } from "react";
import StudentDetailsPage from "./StudentDetails.jsx";
import Sidebar from "../../components/TeacherSidebar.jsx";

// Firebase
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";

// Auth Context (بدل TeacherContext)
import { useAuth } from "../../context/AuthContext.jsx";

export default function StudentsPage() {
  const { profile } = useAuth();
  const teacherId = profile?.uid; // نفترض أن ID المدرس هو uid من الفايربيز

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ---------------------- Fetch Students ----------------------
  useEffect(() => {
    if (!teacherId) return;

    const fetchStudents = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // فلترة الطلاب حسب المدرس
        data = data.filter((student) => student.teacherId === teacherId);

        setStudents(data);
      } catch (error) {
        console.log("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [teacherId]);

  // ---------------------- Fetch Courses ----------------------
  useEffect(() => {
    if (!teacherId) return;

    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courses"));
        let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        data = data.filter((course) => course.teacherId === teacherId);

        setCourses(data.map((c) => c.name));
      } catch (error) {
        console.log("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [teacherId]);

  // ---------------------- Filter Students ----------------------
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      filterCourse === "all" ||
      student.enrolledCourses?.includes(filterCourse);

    return matchesSearch && matchesCourse;
  });

  // ---------------------- Stats ----------------------
  const totalStudents = students.length;

  const newThisMonth =
    students.filter((s) => {
      if (!s.createdAt) return false;

      const created = s.createdAt.toDate
        ? s.createdAt.toDate()
        : new Date(s.createdAt);

      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length || 0;

  const allProgress = students.flatMap((s) =>
    s.progress ? Object.values(s.progress) : []
  );

  const avgProgress =
    allProgress.length > 0
      ? Math.round(
          allProgress.reduce((a, b) => a + b, 0) / allProgress.length
        )
      : 0;

  // ------------------ UI Components ------------------
  const StatCard = ({ title, value }) => (
    <div className="bg-[var(--card)] shadow rounded-xl p-6 text-center">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );

  const StudentCard = ({ student }) => {
    const progressValues = student.progress
      ? Object.values(student.progress)
      : [0];

    const studentAvgProgress = Math.round(
      progressValues.reduce((a, b) => a + b, 0) / progressValues.length
    );

    return (
      <div className="bg-[var(--card)] border rounded-xl p-4 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[var(--primary)] text-white flex items-center justify-center rounded-full font-semibold">
            {student.name?.[0] || "?"}
          </div>
          <div>
            <h3 className="font-semibold">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <p className="text-sm">
            Courses:{" "}
            <span className="font-semibold">
              {student.enrolledCourses?.length || 0}
            </span>
          </p>

          <p className="text-sm">
            Avg Progress:{" "}
            <span className="font-semibold">{studentAvgProgress}%</span>
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

  if (selectedStudent) {
    return (
      <StudentDetailsPage
        studentId={selectedStudent.id}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />

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
              {courses.map((course) => (
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
