import Sidebar from "../../components/TeacherSidebar.jsx";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useNavigate } from "react-router-dom";

export default function TeachersCoursesStyled({ teacherId }) {
  const [courses, setCourses] = useState([]);
  const [filterType, setFilterType] = useState(""); // فلتر النوع
  const navigate = useNavigate();

  const handleAddContent = (courseId) => {
    navigate(`/teacher/edit-course/${courseId}`);
  };

  useEffect(() => {
    if (!teacherId) return;

    const getTeacherCourses = async () => {
      try {
        const q = query(
          collection(db, "courses"),
          where("teacherId", "==", teacherId)
        );

        const querySnapshot = await getDocs(q);
        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error getting courses:", error);
      }
    };

    getTeacherCourses();
  }, [teacherId]);

  // فلتر الكورسات حسب النوع
  const filteredCourses = courses.filter((c) =>
    filterType ? c.type === filterType : true
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] font-[Poppins]">
      <Sidebar />

      <div className="flex-1 p-8 space-y-6">
        <h2 className="text-3xl font-bold text-[var(--primary)]">
          My Courses
        </h2>

        {/* فلتر النوع */}
        <div className="mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 rounded-xl border shadow-sm"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="">All Types</option>
            <option value="interactive">Interactive</option>
            <option value="recorded">Recorded</option>
          </select>
        </div>

        {filteredCourses.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-lg">
            No courses found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg">
            <table className="min-w-full bg-[var(--card)] border border-[var(--border)] rounded-xl">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase text-sm tracking-wide">
                <tr>
                  <th className="p-4 text-left">Thumbnail</th>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Students</th>
                  <th className="p-4 text-left">Rating</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--primary-light)] transition-all duration-200"
                  >
                    <td className="p-3">
                      <img
                        src={course.thumbnail || "/placeholder.png"}
                        alt="thumbnail"
                        className="w-16 h-16 rounded-lg object-cover shadow-sm"
                      />
                    </td>

                    <td className="p-3 font-medium text-[var(--foreground)]">
                      {course.title}
                    </td>

                    <td className="p-3 font-semibold text-[var(--primary)]">
                      {course.price} EGP
                    </td>

                    <td className="p-3 text-center font-medium">
                      {course.studentsCount || 0}
                    </td>

                    <td className="p-3 text-center font-medium">
                      {course.avgSatisfaction ? course.avgSatisfaction.toFixed(1) : 0}
                    </td>

                    <td className="p-3 text-center">
                      <span className="px-3 py-1 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] font-medium">
                        {course.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        className="
                          bg-[var(--primary)]
                          text-[var(--primary-foreground)]
                          px-4 py-2
                          rounded-lg
                          shadow-md
                          hover:opacity-90
                          transition
                          duration-200
                        "
                        onClick={() => handleAddContent(course.id)}
                      >
                        Add Content
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
