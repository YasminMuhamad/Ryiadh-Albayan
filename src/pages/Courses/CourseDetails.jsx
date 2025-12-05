import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../firebase.config";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { uid } = useAuth();
  const fromPaymentSuccess = Boolean(location.state?.fromPaymentSuccess);
  const [course, setCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const courses = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const teachersData = teachersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTeachers(teachersData);
        const foundCourse = courses.find((c) => c.id === id);
        setCourse(foundCourse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    const fetchModulesAndLessons = async () => {
      if (!id) return;
      try {
        const modulesSnap = await getDocs(query(collection(db, "modules"), where("courseId", "==", id)));
        const lessonsSnap = await getDocs(query(collection(db, "lessons"), where("courseId", "==", id)));

        const modulesData = modulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const lessonsData = lessonsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const sortedModules = [...modulesData].sort((a, b) => (a.order || 0) - (b.order || 0));
        const modulesWithLessons = sortedModules.map((mod) => ({
          ...mod,
          lessons: lessonsData
            .filter((lesson) => lesson.moduleId === mod.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0)),
        }));

        const looseLessons = lessonsData.filter((lesson) => !lesson.moduleId);
        if (modulesWithLessons.length === 0 && looseLessons.length > 0) {
          modulesWithLessons.push({
            id: "un-grouped",
            title: "Lessons",
            description: "All lessons",
            lessons: looseLessons.sort((a, b) => (a.order || 0) - (b.order || 0)),
          });
        }

        setModules(modulesWithLessons);

        const firstLesson =
          modulesWithLessons.find((m) => m.lessons?.length)?.lessons?.[0] ||
          looseLessons?.[0] ||
          null;
        setSelectedLesson(firstLesson || null);
      } catch (err) {
        console.error("Failed to fetch modules/lessons", err);
      }
    };

    fetchModulesAndLessons();
  }, [id]);

  // Check enrollment for the current user and course
  // Consolidated enrollment detection: listen to enrollments and payments, and include payment-success state
  useEffect(() => {
    if (!uid || !id) {
      setIsEnrolled(false);
      return;
    }

    const enrollmentRef = doc(db, "users", uid, "enrollments", id);
    const paymentsQuery = query(collection(db, "payments"), where("studentId", "==", uid));

    const unsubEnroll = onSnapshot(
      enrollmentRef,
      (snap) => {
        if (snap.exists()) setIsEnrolled(true);
      },
      (err) => console.error("Failed to check enrollment", err)
    );

    const unsubPayments = onSnapshot(
      paymentsQuery,
      (snap) => {
        const hasCourse = snap.docs.some((d) => {
          const courses = d.data().courses;
          return Array.isArray(courses) && courses.some((c) => c.id === id || c.courseId === id);
        });
        if (hasCourse) setIsEnrolled(true);
      },
      (err) => console.error("Failed to watch payments for enrollment", err)
    );

    const paidCourses = location.state?.courses || [];
    if (fromPaymentSuccess && paidCourses.some((c) => c.id === id)) {
      setIsEnrolled(true);
    }

    return () => {
      unsubEnroll();
      unsubPayments();
    };
  }, [uid, id, fromPaymentSuccess, location.state]);

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? "Name : " + teacher.name : "محاضر متخصص";
  };

  const getTeacherImage = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.profile_pic || teacher?.image || teacher?.thumbnail ;
  };

  const getTeacherEmail = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? "Email : " + teacher.email : "instructor@riyadhalbayan.com";
  };

  const getTeacherSpecialization = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.specialization : "Specialized in Islamic Education and Arabic Language";
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="half-fill">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill="url(#half-fill)" stroke="currentColor" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      }
    }
    return stars;
  };

  const currentVideoUrl = useMemo(() => selectedLesson?.videoUrl || selectedLesson?.video || "", [selectedLesson]);
  const currentLessonTitle = selectedLesson?.title || "Select a lesson to play";
  const currentLessonDesc = selectedLesson?.description || selectedLesson?.summary || "";
  const displayPrice = typeof course?.price === "number" ? course.price : course?.price || 149;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h2>
          <button
            onClick={() => navigate("/courses")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate("/courses")}
          className="mb-6 flex items-center text-teal-600 hover:text-teal-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        <div className={`grid grid-cols-1 ${fromPaymentSuccess ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-8`}>
          <div className="lg:col-span-2">
            <div className="relative mb-6 overflow-hidden rounded-2xl">
              <img
                src={course.thumbnail || course.image || "/api/placeholder/800/400"}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover transition-all duration-700 ease-in-out hover:scale-125 hover:brightness-110"
                onError={(e) => {
                  e.target.src = "/api/placeholder/800/400";
                }}
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Recorded Course
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3">
                  {renderStars(course.rating || 0)}
                </div>
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {course.rating || 0}
                </span>
                <span className="text-gray-500">
                  ({course.reviewsCount || 0} reviews)
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {course.description}
              </p>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Lessons</p>
                    <p className="font-semibold text-gray-900">{course.totalLessons || 0} lessons</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Modules</p>
                    <p className="font-semibold text-gray-900">{course.totalModules || 0} modules</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{course.category || "General"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={getTeacherImage(course.teacherId)}
                  alt={getTeacherName(course.teacherId)}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/150/150";
                  }}
                />
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-gray-900 leading-tight">{getTeacherName(course.teacherId)}</h3>
                  <p className="text-sm text-gray-600 leading-tight">{getTeacherEmail(course.teacherId)}</p>
                  <p className="text-gray-700 leading-tight">
                    {getTeacherSpecialization(course.teacherId)}
                  </p>
                </div>
              </div>
            </div>

            {fromPaymentSuccess && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-teal-600 uppercase">Lesson Player</p>
                      <h3 className="text-xl font-bold text-gray-900">{currentLessonTitle}</h3>
                      {currentLessonDesc && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{currentLessonDesc}</p>}
                    </div>
                    {selectedLesson?.duration && (
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                        {selectedLesson.duration} mins
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-900">
                    {currentVideoUrl ? (
                      <video
                        key={currentVideoUrl}
                        src={currentVideoUrl}
                        controls
                        className="w-full h-64 md:h-96 bg-black"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="h-64 md:h-96 flex items-center justify-center text-gray-200 text-sm">
                        Select a lesson to start playing
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-h-[32rem] overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Lessons</h3>
                    <span className="text-xs text-gray-500">
                      {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} total
                    </span>
                  </div>

                  {modules.length === 0 && (
                    <p className="text-sm text-gray-500">Lessons will appear here once available.</p>
                  )}

                  <div className="space-y-3">
                    {modules.map((module) => (
                      <div key={module.id} className="border border-gray-100 rounded-xl">
                        <div className="px-3 py-2 bg-gray-50 rounded-t-xl">
                          <p className="text-xs uppercase text-gray-500 font-semibold">{module.title || "Module"}</p>
                          {module.description && <p className="text-sm text-gray-600 line-clamp-2">{module.description}</p>}
                        </div>
                        <div className="divide-y divide-gray-100">
                          {(module.lessons || []).map((lesson) => {
                            const isActive = selectedLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLesson(lesson)}
                                className={`w-full text-left px-3 py-3 flex items-center gap-3 transition ${
                                  isActive ? "bg-teal-50 border-l-4 border-teal-500" : "hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isActive ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  ▶
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{lesson.title || "Lesson"}</p>
                                  {lesson.description && (
                                    <p className="text-xs text-gray-600 truncate">{lesson.description}</p>
                                  )}
                                </div>
                                {lesson.duration && (
                                  <span className="text-xs text-gray-500 whitespace-nowrap">{lesson.duration}m</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!fromPaymentSuccess && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-teal-600">${displayPrice}</span>
                  </div>
                  <p className="text-gray-500">One-time payment</p>
                </div>

                <button
                  onClick={() => !isEnrolled && navigate(`/checkout/${course.id}`)}
                  disabled={isEnrolled}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out mb-6 ${
                    isEnrolled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 hover:shadow-xl hover:-translate-y-1 transform"
                  }`}
                >
                  {isEnrolled ? "Already Enrolled" : "Enroll Now"}
                </button>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Access</span>
                    <span className="font-medium">Lifetime</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium">Video</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Certificate</span>
                    <span className="font-medium">Yes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
