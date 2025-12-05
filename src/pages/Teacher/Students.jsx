import React, { useEffect, useState } from "react";
import Sidebar from "../../components/TeacherSidebar.jsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

export default function StudentsDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchCourses();
  }, [user]);

  async function fetchCourses() {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, where("teacherId", "==", user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCourses(data);
    fetchEnrollments(data);
  }

  async function fetchEnrollments(coursesData) {
    const usersSnap = await getDocs(collection(db, "users"));
    let allEnrollments = [];

    for (let userDoc of usersSnap.docs) {
      const enrollRef = collection(db, "users", userDoc.id, "enrollments");
      const enrollSnap = await getDocs(enrollRef);

      enrollSnap.forEach((enr) => {
        const course = coursesData.find((c) => c.id === enr.data().courseId);
        if (course) {
          allEnrollments.push({
            userId: userDoc.id,
            userName: userDoc.data().name || "No Name",
            email: userDoc.data().email,
            gender: userDoc.data().gender || "",
            phone: userDoc.data().phone || "",
            profile_pic: userDoc.data().profile_pic || "",
            courseTitle: course.title,
            courseType: course.type,
            coursePrice: course.price,
            purchasedAt: enr.data().purchasedAt,
            percent: enr.data().percent,
            completedLessonsCount: enr.data().completedLessonsCount,
            quizzesTaken: enr.data().quizzesTaken,
            status: enr.data().status,
          });
        }
      });
    }

    setEnrollments(allEnrollments);
  }

  // ---------------- FILTERS ----------------
  const filteredData = enrollments
    .filter((item) => {
      const byCourse = selectedCourse ? item.courseTitle === selectedCourse : true;
      const byType = selectedType ? item.courseType === selectedType : true;
      return byCourse && byType;
    })
    .filter((item) => {
      const s = search.toLowerCase();
      return (
        item.userName.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        item.courseTitle.toLowerCase().includes(s)
      );
    });

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { background: "var(--chart-2)", color: "var(--foreground)" };
      case "active":
        return { background: "var(--secondary)", color: "var(--secondary-foreground)" };
      case "in-progress":
        return { background: "var(--muted)", color: "var(--muted-foreground)" };
      default:
        return { background: "var(--muted)", color: "var(--muted-foreground)" };
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)", fontFamily: "Cairo" }}>
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-3xl mb-6" style={{ color: "var(--primary)", fontWeight: "700" }}>
          Students Enrollments Dashboard
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="p-3 rounded-xl border shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-3 rounded-xl border shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <option value="">All Types</option>
            <option value="interactive">Interactive</option>
            <option value="recorded">Recorded</option>
          </select>

          <input
            type="text"
            placeholder="Search student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-xl border shadow-sm col-span-2"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>

        {/* Table */}
        <div className="p-4 rounded-xl shadow-md overflow-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Purchased At</th>
                <th className="p-3 text-left">Progress</th>
                <th className="p-3 text-left">Lessons</th>
                <th className="p-3 text-left">Quizzes</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3" style={{ color: "var(--foreground)" }}>{row.userName}</td>
                  <td className="p-3" style={{ color: "var(--muted-foreground)" }}>{row.email}</td>
                  <td className="p-3">{row.courseTitle}</td>
                  <td className="p-3 capitalize">
                    <span
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        background: row.courseType === "interactive" ? "var(--secondary)" : "var(--muted)",
                        color: "var(--foreground)",
                      }}
                    >
                      {row.courseType}
                    </span>
                  </td>
                  <td className="p-3">{row.coursePrice ? `$${row.coursePrice}` : "-"}</td>
                  <td className="p-3">{row.purchasedAt ? new Date(row.purchasedAt.seconds * 1000).toLocaleDateString() : "-"}</td>
                  <td className="p-3" style={{ fontWeight: "600", color: "var(--primary)" }}>{row.percent || 0}%</td>
                  <td className="p-3">{row.completedLessonsCount || 0}</td>
                  <td className="p-3">{row.quizzesTaken || 0}</td>
                  <td className="p-3">
                    <span
                      className="px-3 py-1 rounded-full text-sm"
                      style={getStatusStyle(row.status)}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4" style={{ color: "var(--foreground)", fontWeight: "600" }}>
            Total Students: <span style={{ color: "var(--primary)" }}>{filteredData.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
