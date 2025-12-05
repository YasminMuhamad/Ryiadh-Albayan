// pages/Teacher/InteractiveCourses.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import Sidebar from "../../components/TeacherSidebar.jsx";
import Loader from "../../components/Loader.jsx";

export default function InteractiveCourses() {
  const { uid, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const q = query(
          collection(db, "courses"),
          where("teacherId", "==", uid),
          where("type", "==", "interactive")
        );
        const snapshot = await getDocs(q);
        const coursesData = [];

        for (let docSnap of snapshot.docs) {
          const course = docSnap.data();
          const courseId = docSnap.id;

          const modulesSnap = await getDocs(collection(db, `courses/${courseId}/modules`));
          const liveLessons = [];

          for (let moduleDoc of modulesSnap.docs) {
            const lessonsSnap = await getDocs(
              collection(db, `courses/${courseId}/modules/${moduleDoc.id}/lessons`)
            );

            lessonsSnap.docs.forEach(lessonDoc => {
              const lesson = lessonDoc.data();
              if (lesson.liveSession || lesson.dateTime) {
                liveLessons.push({
                  ...lesson,
                  lessonTitle: lesson.title,
                  link: lesson.liveSession?.link || "",
                  materials: lesson.materials || [],
                  duration: lesson.duration || 0,
                  dateTime: lesson.dateTime,
                });
              }
            });
          }

          coursesData.push({ ...course, id: courseId, liveLessons });
        }

        setCourses(coursesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [uid]);

  if (loading || loadingCourses) return <Loader />;

  const now = new Date();

  const getLessonStatus = (lesson) => {
    let start;
    if (lesson.dateTime?.seconds) {
      start = new Date(lesson.dateTime.seconds * 1000);
    } else {
      start = new Date(lesson.dateTime);
    }

    const end = new Date(start.getTime() + lesson.duration * 60000);

    if (now < start) return { status: "Upcoming", className: "bg-secondary text-secondary-foreground" };
    if (now >= start && now <= end) return { status: "Ongoing", className: "bg-primary text-primary-foreground" };
    return { status: "Completed", className: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8">
        <h1 className="heading-1">Interactive Courses & Live Lessons</h1>

        {courses.length === 0 && <p className="paragraph">No interactive courses found.</p>}

        {courses.map((course) => (
          <div key={course.id} className="card animate-fadeIn">
            {/* Course Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <img src={course.thumbnail} alt={course.title} className="h-24 w-24 object-cover rounded-lg" />
              <div className="flex-1 space-y-1">
                <h2 className="font-semibold text-xl">{course.title}</h2>
                <p className="paragraph">{course.description}</p>
                <div className="flex gap-4 mt-1 text-sm">
                  <span>Completion: {course.avgCompletion || 0}%</span>
                  <span>Satisfaction: {course.avgSatisfaction || 0} ⭐</span>
                </div>
              </div>
            </div>

            {/* Live Lessons */}
            {course.liveLessons.length === 0 && <p className="paragraph">No live lessons yet.</p>}

            <div className="grid md:grid-cols-2 gap-4">
              {course.liveLessons.map((lesson, i) => {
                const { status, className } = getLessonStatus(lesson);
                let start = lesson.dateTime?.seconds
                  ? new Date(lesson.dateTime.seconds * 1000)
                  : new Date(lesson.dateTime);
                const showJoinButton = status === "Ongoing" && lesson.link;

                return (
                  <div key={i} className="card p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{lesson.lessonTitle}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${className}`}>{status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Date: {start.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Duration: {lesson.duration} mins</p>

                      {/* Materials */}
                      {lesson.materials?.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {lesson.materials.map((mat, idx) => (
                            <button
                              key={idx}
                              onClick={() => window.open(mat.file, "_blank")}
                              className="btn-secondary px-3 py-1 text-sm rounded hover:bg-secondary hover:text-secondary-foreground transition"
                            >
                              {mat.title}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic text-red-500 mt-2">Notes Not Found</p>
                      )}
                    </div>

                    {/* Join Button */}
                    {showJoinButton ? (
                      <a
                        href={lesson.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary mt-3 text-center hover:scale-105 transition-transform"
                      >
                        Join Session
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
