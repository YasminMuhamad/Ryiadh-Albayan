import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../firebase.config";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { uid, user, profile, role } = useAuth();
  const fromPaymentSuccess = Boolean(location.state?.fromPaymentSuccess);
  const [course, setCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openModules, setOpenModules] = useState({});
  const [completedLessons, setCompletedLessons] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [playingLessonId, setPlayingLessonId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});

  const computeAverageRating = (reviews = []) => {
    if (!reviews.length) return 0;
    const nums = reviews
      .map((r) => (typeof r?.rating === "number" ? r.rating : parseFloat(r?.rating)))
      .filter((n) => !Number.isNaN(n));
    if (!nums.length) return 0;
    const avg = nums.reduce((a, n) => a + n, 0) / nums.length;
    return Number(avg.toFixed(1));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseDoc, categoriesSnap, teachersSnapshot, reviewsSnap] = await Promise.all([
          getDoc(doc(db, "courses", id)),
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "teachers")),
          getDocs(collection(db, "courses", id, "reviews")),
        ]);

        const catMap = categoriesSnap.docs.reduce((acc, d) => {
          const data = d.data();
          acc[d.id] = data.title || data.name || d.id;
          return acc;
        }, {});
        setCategoriesMap(catMap);

        const reviewsList = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews(reviewsList);

        if (courseDoc.exists()) {
          const data = courseDoc.data();
          const categoryId = data.categoryId || data.category;
          const categoryLabel = catMap[categoryId] || data.category || "Course";
          setCourse({
            id: courseDoc.id,
            ...data,
            rating: computeAverageRating(reviewsList),
            reviewsCount: reviewsList.length,
            categoryId,
            category: categoryLabel,
          });
        } else {
          setCourse(null);
        }

        const teachersData = teachersSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setTeachers(teachersData);
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
      const progressKey = `course-progress-${id}-${uid || "anon"}`;
      try {
        // fetch modules under this course
        const modulesSnap = await getDocs(collection(db, "courses", id, "modules"));
        const modulesData = modulesSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const lessonsMap = {};
        const quizzesMap = {};
        // fetch lessons and quizzes for each module in parallel
        await Promise.all(
          modulesData.map(async (mod) => {
            const lessonsSnap = await getDocs(collection(db, "courses", id, "modules", mod.id, "lessons"));
            lessonsMap[mod.id] = lessonsSnap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => (a.order || 0) - (b.order || 0));

            const quizzesSnap = await getDocs(collection(db, "courses", id, "modules", mod.id, "quizzes"));
            const normalizeOptions = (opts) => {
              if (Array.isArray(opts)) return opts;
              if (opts && typeof opts === "object") {
                const keys = Object.keys(opts).filter((k) => !Number.isNaN(Number(k)));
                if (keys.length) return keys.sort((a, b) => Number(a) - Number(b)).map((k) => opts[k]).filter(Boolean);
                return Object.values(opts);
              }
              return [];
            };

            const normalizeQuestions = (raw) => {
              // questions as array
              if (Array.isArray(raw.questions)) return raw.questions.map((q) => ({ ...q, options: normalizeOptions(q.options) }));

              // questions as object with numeric keys
              if (raw.questions && typeof raw.questions === "object") {
                const keysQ = Object.keys(raw.questions).filter((k) => !Number.isNaN(Number(k)));
                if (keysQ.length) {
                  return keysQ
                    .sort((a, b) => Number(a) - Number(b))
                    .map((k) => {
                      const q = raw.questions[k];
                      return { ...q, options: normalizeOptions(q?.options) };
                    })
                    .filter(Boolean);
                }
              }

              // Firestore arrays stored as numbered keys (0,1,2,...) on root
              const numericKeys = Object.keys(raw || {}).filter((k) => !Number.isNaN(Number(k)));
              if (numericKeys.length) {
                return numericKeys
                  .sort((a, b) => Number(a) - Number(b))
                  .map((k) => {
                    const q = raw[k];
                    return {
                      ...q,
                      options: normalizeOptions(q?.options),
                    };
                  })
                  .filter(Boolean);
              }

              // Single-question docs (question/options/correctAnswer) fallback
              if (raw.question || raw.options || raw.correctAnswer) {
                return [
                  {
                    question: raw.question || raw.title || "Question",
                    options: normalizeOptions(raw.options),
                    correctAnswer: raw.correctAnswer,
                  },
                ];
              }

              return [];
            };

            quizzesMap[mod.id] = quizzesSnap.docs
              .map((doc) => {
                const raw = { id: doc.id, ...doc.data() };
                const questions = normalizeQuestions(raw);

                const cleaned = {
                  ...raw,
                  questions,
                  questionsCount: raw.questionsCount ?? questions.length,
                };

                // Remove numeric keys to avoid noise
                Object.keys(cleaned).forEach((k) => {
                  if (!Number.isNaN(Number(k))) delete cleaned[k];
                });

                return cleaned;
              })
              .sort((a, b) => (a.order || 0) - (b.order || 0));
          })
        );

        // if there is a top-level lessons collection under course (fallback)
        let looseLessons = [];
        try {
          const looseSnap = await getDocs(collection(db, "courses", id, "lessons"));
          looseLessons = looseSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        } catch (err) {
          looseLessons = [];
        }

        const modulesWithLessons =
          modulesData.length > 0
            ? modulesData.map((mod) => ({
              ...mod,
              lessons: lessonsMap[mod.id] || [],
              quizzes: quizzesMap[mod.id] || [],
            }))
            : looseLessons.length > 0
              ? [
                {
                  id: "un-grouped",
                  title: "Lessons",
                  description: "All lessons",
                  lessons: looseLessons,
                  quizzes: [],
                },
              ]
              : [];

        setModules(modulesWithLessons);

        const firstLesson =
          modulesWithLessons.find((m) => m.lessons?.length)?.lessons?.[0] ||
          looseLessons?.[0] ||
          null;
        setSelectedLesson(firstLesson || null);
        // default: open modules that have lessons
        const initialOpen = {};
        modulesWithLessons.forEach((m, idx) => {
          initialOpen[m.id] = idx === 0;
        });
        setOpenModules(initialOpen);

        // load completed lessons from localStorage
        try {
          const saved = JSON.parse(localStorage.getItem(progressKey) || "{}");
          setCompletedLessons(saved);
        } catch {
          setCompletedLessons({});
        }
      } catch (err) {
        console.error("Failed to fetch modules/lessons", err);
        setModules([]);
        setSelectedLesson(null);
      }
    };

    fetchModulesAndLessons();
  }, [id, uid]);

  // Listen to course reviews (comments)
  useEffect(() => {
    if (!id) return;
    const reviewsRef = collection(db, "courses", id, "reviews");
    const unsub = onSnapshot(
      query(reviewsRef, orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews(list);
      },
      (err) => console.error("Failed to fetch reviews", err)
    );
    return () => unsub();
  }, [id]);

  // Sync cart status for this course
  useEffect(() => {
    const sync = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setInCart(cart.includes(id));
      } catch {
        setInCart(false);
      }
    };
    sync();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, [id]);

  // If enrolled, purge from cart and hide cart state
  useEffect(() => {
    if (!isEnrolled || !id) return;
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updated = cart.filter((cid) => cid !== id);
      localStorage.setItem("cart", JSON.stringify(updated));
      setInCart(false);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      /* ignore */
    }
  }, [isEnrolled, id]);

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
    return teacher?.profile_pic || teacher?.image || teacher?.thumbnail || "/placeholder-avatar.png";
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

  const currentVideoUrl = useMemo(() => {
    const raw = selectedLesson?.videoUrl || selectedLesson?.url || selectedLesson?.video || "";
    const candidate =
      typeof raw === "string"
        ? raw
        : raw && typeof raw === "object" && typeof raw.file === "string"
          ? raw.file
          : "";
    // Accept only http(s) links; otherwise leave empty to avoid broken player
    return typeof candidate === "string" && /^https?:\/\//i.test(candidate) ? candidate : "";
  }, [selectedLesson]);

  const liveSessionLink = useMemo(() => {
    const fromLesson =
      selectedLesson?.liveSession?.link ||
      selectedLesson?.liveSession?.url ||
      selectedLesson?.liveSession?.joinUrl;
    const fromCourse =
      course?.liveSessionLink || course?.liveSession?.link || course?.liveSession?.url || course?.liveLink;
    return (fromLesson || fromCourse || "").toString();
  }, [selectedLesson, course]);

  const liveSessionTime = useMemo(() => {
    const ts =
      selectedLesson?.liveSession?.dateTime ||
      course?.liveSession?.dateTime ||
      course?.liveSessionDateTime;
    if (!ts) return "";
    if (ts?.toDate) return ts.toDate().toLocaleString();
    const asDate = new Date(ts);
    return Number.isNaN(asDate.getTime()) ? "" : asDate.toLocaleString();
  }, [selectedLesson, course]);

  const totalQuizzes = useMemo(
    () => modules.reduce((acc, m) => acc + ((m.quizzes || []).length || 0), 0),
    [modules]
  );

  const handleVideoEnd = () => {
    if (!selectedLesson?.id || !id) return;
    const progressKey = `course-progress-${id}-${uid || "anon"}`;
    setCompletedLessons((prev) => {
      const updated = { ...prev, [selectedLesson.id]: true };
      try {
        localStorage.setItem(progressKey, JSON.stringify(updated));
      } catch { }
      return updated;
    });
    setPlayingLessonId(null);
  };
  const handleSubmitReview = async () => {
    if (!canComment) {
      toast.error("You need access to this course to leave a review.");
      return;
    }
    if (!uid) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    const text = reviewText.trim();
    const rating = Number(reviewRating) || 0;
    if (!text) {
      toast.error("Write a comment before sending.");
      return;
    }
    setSubmittingReview(true);
    try {
      const reviewsRef = collection(db, "courses", id, "reviews");
      await addDoc(reviewsRef, {
        comment: text,
        rating,
        userId: uid,
        userName: profile?.name || user?.displayName || "Student",
        createdAt: serverTimestamp(),
      });
      setReviewText("");
      toast.success("Your comment has been successfully added.");
    } catch (err) {
      console.error("Failed to add review", err);
      toast.error("Failed to save your review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const paidFromState = useMemo(() => {
    const paidCourses = Array.isArray(location.state?.courses) ? location.state.courses : [];
    return paidCourses.some((c) => c.id === id || c.courseId === id);
  }, [location.state, id]);

  const canComment = isEnrolled || fromPaymentSuccess || paidFromState;
  const requireLoginForPayment = () => {
    if (!uid || role !== "student") {
      setShowLoginModal(true);
      return true;
    }
    return false;
  };

  const mergedRating = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const nums = reviews
      .map((r) => (typeof r?.rating === "number" ? r.rating : parseFloat(r?.rating)))
      .filter((n) => !Number.isNaN(n));
    const count = nums.length;
    const avg = nums.length ? Number((nums.reduce((a, n) => a + n, 0) / nums.length).toFixed(1)) : 0;
    return { avg, count };
  }, [reviews]);

  const displayReviewsCount = reviews.length;
  const fmtDate = (ts) => {
    if (!ts) return "";
    if (ts?.toDate) return ts.toDate().toLocaleString();
    if (typeof ts === "string") return ts;
    return new Date(ts).toLocaleString();
  };
  const toggleCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let updated;
      if (cart.includes(id)) {
        updated = cart.filter((cid) => cid !== id);
        toast("Removed from cart");
      } else {
        updated = Array.from(new Set([...cart, id]));
        toast.success("Added to cart");
      }
      localStorage.setItem("cart", JSON.stringify(updated));
      setInCart(updated.includes(id));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Unable to update cart. Please try again.");
    }
  };
  const currentLessonTitle = selectedLesson?.title || "Select a lesson to play";
  const currentLessonDesc = selectedLesson?.description || selectedLesson?.summary || "";
  const displayPrice = typeof course?.price === "number" ? course.price : course?.price || 149;
  const courseTypeLabel = (() => {
    const t = (course?.type || "recorded").toString().toLowerCase();
    if (t.includes("interactive") || t.includes("live")) return "Interactive Session";
    return "Recorded Course";
  })();
  const isInteractiveCourse = useMemo(() => {
    const t = (course?.type || "recorded").toString().toLowerCase();
    return t.includes("interactive") || t.includes("live");
  }, [course?.type]);
  const courseFormatLabel = useMemo(() => {
    return isInteractiveCourse ? "Live Session" : "Video";
  }, [isInteractiveCourse]);

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
                  {courseTypeLabel}
                </span>
              </div>
            </div>

            {showLoginModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowLoginModal(false)} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 animate-slideUp">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
                      !
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">Sign in required</h4>
                      <p className="text-sm text-gray-600">Please sign in with a student account before proceeding to checkout.</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowLoginModal(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition transform hover:-translate-y-0.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowLoginModal(false);
                        navigate("/login", { state: { from: location.pathname } });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition shadow-md transform hover:-translate-y-0.5"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3">
                  {renderStars(mergedRating.avg || 0)}
                </div>
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {mergedRating.avg || 0}
                </span>
                <span className="text-gray-500">
                  ({mergedRating.count || displayReviewsCount} reviews)
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
                    e.target.onerror = null;
                    e.target.src = "/placeholder-avatar.png";
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
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col">
                  {!isInteractiveCourse && (
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
                  )}
                  {isInteractiveCourse ? (
                    <div className="p-6 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-teal-600 uppercase">Live Session</p>
                          <h4 className="text-lg font-bold text-gray-900 mt-1">
                            {selectedLesson?.liveSession?.title || "Join the live session"}
                          </h4>
                          {liveSessionTime && (
                            <p className="text-sm text-gray-600">Scheduled: {liveSessionTime}</p>
                          )}
                        </div>
                        {liveSessionLink ? (
                          <a
                            href={liveSessionLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
                          >
                            Join Session
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500">Link not available yet</span>
                        )}
                      </div>
                      {selectedLesson?.liveSession?.notes && (
                        <p className="mt-3 text-sm text-gray-700">{selectedLesson.liveSession.notes}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-900">
                      {currentVideoUrl ? (
                        <video
                          key={currentVideoUrl}
                          src={currentVideoUrl}
                          controls
                          controlsList="nodownload noremoteplayback"
                          disablePictureInPicture
                          className="w-full h-64 md:h-96 bg-black"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          onPlay={() => {
                            if (selectedLesson?.id) setPlayingLessonId(selectedLesson.id);
                          }}
                          onEnded={handleVideoEnd}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="h-64 md:h-96 flex items-center justify-center text-gray-200 text-sm">
                          Select a lesson to start playing
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isInteractiveCourse ? "Quizzes" : "Modules"}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {isInteractiveCourse ? totalQuizzes : modules.length} total
                    </span>
                  </div>

                  {modules.length === 0 && (
                    <p className="text-sm text-gray-500">Lessons will appear here once available.</p>
                  )}

                  <div className="space-y-3">
                    {modules.map((module) => {
                      const lessonCount = module.lessons?.length || 0;
                      const quizCount = (module.quizzes || []).length;
                      const showLessons = !isInteractiveCourse;
                      const countLabel = showLessons
                        ? `${lessonCount} lessons`
                        : `${quizCount} ${quizCount === 1 ? "quiz" : "quizzes"}`;
                      const isOpen = isInteractiveCourse ? true : openModules[module.id];
                      return (
                        <div key={module.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          {!isInteractiveCourse && (
                            <button
                              onClick={() =>
                                setOpenModules((prev) => ({ ...prev, [module.id]: !prev[module.id] }))
                              }
                              className="w-full px-3 py-3 bg-gray-50 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs uppercase text-gray-500 font-semibold">
                                  {module.title || "Quiz"}
                                </span>
                                <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                                  {countLabel}
                                </span>
                              </div>
                              <span className="text-gray-500 text-sm">{isOpen ? "−" : "+"}</span>
                            </button>
                          )}

                          {isOpen && (
                            <div className="divide-y divide-gray-100">
                              {!isInteractiveCourse && (
                                <>
                                  {(module.lessons || []).map((lesson) => {
                                    const isActive = selectedLesson?.id === lesson.id;
                                    const isDone = completedLessons[lesson.id];
                                    const isPlaying = playingLessonId === lesson.id;
                                    return (
                                      <button
                                        key={lesson.id}
                                        onClick={() => {
                                          setSelectedLesson(lesson);
                                          setPlayingLessonId(null);
                                        }}
                                        className={`w-full text-left px-3 py-3 flex items-center gap-3 transition ${isActive ? "bg-teal-50 border-l-4 border-teal-500" : "hover:bg-gray-50"
                                          }`}
                                      >
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive
                                              ? "bg-teal-500 text-white"
                                              : "bg-gray-200 text-gray-700"
                                            }`}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                          >
                                            <path d="M6 4.667c0-1.02 1.12-1.648 1.98-1.101l9.05 5.75c.78.497.78 1.67 0 2.167l-9.05 5.75C8.12 17.78 7 17.152 7 16.132V4.667z" />
                                          </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-sm text-gray-900 truncate">
                                            {lesson.title || "Lesson"}
                                          </p>
                                          {lesson.description && (
                                            <p className="text-xs text-gray-600 truncate">{lesson.description}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 pl-2">
                                          {lesson.duration && (
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                              {lesson.duration}m
                                            </span>
                                          )}
                                          <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isDone
                                                ? "bg-teal-600 text-white border-teal-600"
                                                : isPlaying
                                                  ? "bg-teal-50 text-teal-700 border-teal-200"
                                                  : "bg-white text-gray-400 border-gray-200"
                                              }`}
                                          >
                                            ✓
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                  {lessonCount === 0 && (
                                    <div className="px-3 py-3 text-xs text-gray-500">No lessons yet.</div>
                                  )}
                                </>
                              )}
                              {(module.quizzes || []).length > 0 && (
                                <div
                                  className={`${isInteractiveCourse ? "bg-[#f8fafc]" : "bg-gray-50"
                                    } px-3 py-3 ${!isInteractiveCourse ? "" : "border-t border-gray-100"}`}
                                >
                                  <p className="text-xs uppercase font-semibold mb-3 text-slate-500 tracking-wide">
                                    Quizzes
                                  </p>
                                  <div className="space-y-2.5">
                                    {module.quizzes.map((quiz) => (
                                      <div
                                        key={quiz.id}
                                        className={`w-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer ${selectedQuiz?.id === quiz.id ? "ring-1 ring-teal-200" : ""
                                          }`}
                                        onClick={() => {
                                          setSelectedQuiz((prev) => (prev?.id === quiz.id ? null : quiz));
                                          // reset selections when opening a different quiz
                                          setQuizAnswers((prev) => ({
                                            ...prev,
                                            [quiz.id]: prev[quiz.id] || {},
                                          }));
                                        }}
                                      >
                                        <div className="flex items-center justify-between px-4 py-3">
                                          <div className="min-w-0">
                                            <p className="text-base font-semibold text-gray-900 truncate">
                                              {quiz.title || "Quiz"}
                                            </p>
                                            {quiz.description && (
                                              <p className="text-xs text-gray-600 truncate">{quiz.description}</p>
                                            )}
                                            {typeof quiz.questionsCount === "number" && (
                                              <p className="text-sm text-slate-500">{quiz.questionsCount} questions</p>
                                            )}
                                          </div>
                                          <span className="text-sm text-teal-700 font-semibold bg-teal-50 px-3 py-1 rounded-full">
                                            Quiz
                                          </span>
                                        </div>

                                        {selectedQuiz?.id === quiz.id && (
                                          <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
                                            <div className="text-xs text-gray-600 flex items-center justify-between">
                                              <span>
                                                Score:{" "}
                                                {typeof quiz.score === "number" && typeof quiz.total === "number"
                                                  ? `${quiz.score} / ${quiz.total}`
                                                  : `${quiz.questions?.length || quiz.questionsCount || 0} questions`}
                                              </span>
                                              {quiz.result && (
                                                <span
                                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${quiz.result === "passed"
                                                      ? "bg-teal-50 text-teal-700"
                                                      : "bg-red-50 text-red-600"
                                                    }`}
                                                >
                                                  {quiz.result}
                                                </span>
                                              )}
                                            </div>
                                            {(quiz.questions || []).map((q, idx) => {
                                              const selected = quizAnswers?.[quiz.id]?.[idx];

                                              const userAns = q.userAnswer ?? q.answer ?? selected;
                                              const correct = q.correctAnswer ?? q.correct;
                                              const isCorrect =
                                                userAns != null &&
                                                correct != null &&
                                                String(userAns).toLowerCase() === String(correct).toLowerCase();
                                              const showCorrect = selected != null || userAns != null;
                                              return (
                                                <div
                                                  key={idx}
                                                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70"
                                                >
                                                  <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-semibold text-gray-700">
                                                      Q{idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                      <p className="text-sm font-semibold text-gray-900">
                                                        {q.question || q.text || "Question"}
                                                      </p>
                                                      {q.description && (
                                                        <p className="text-xs text-gray-600 mt-1">{q.description}</p>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {q.options && Array.isArray(q.options) && (
                                                    <div className="space-y-2">
                                                      {q.options.map((opt, i) => {
                                                        const isSelected = selected === opt;
                                                        const isCorrectOption =
                                                          showCorrect && correct != null && String(opt) === String(correct);
                                                        const isWrongSelection = showCorrect && isSelected && !isCorrectOption;
                                                        return (
                                                          <button
                                                            key={i}
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setQuizAnswers((prev) => ({
                                                                ...prev,
                                                                [quiz.id]: {
                                                                  ...(prev[quiz.id] || {}),
                                                                  [idx]: opt,
                                                                },
                                                              }));
                                                            }}
                                                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 flex items-center gap-3 ${isCorrectOption
                                                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                                                                : isWrongSelection
                                                                  ? "border-red-200 bg-red-50 text-red-800"
                                                                  : isSelected
                                                                    ? "border-teal-200 bg-white shadow-sm"
                                                                    : "border-gray-200 bg-white hover:border-teal-200 hover:shadow-sm"
                                                              }`}
                                                          >
                                                            <span
                                                              className={`w-6 h-6 rounded-full flex items-center justify-center border ${isCorrectOption
                                                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                                                  : isWrongSelection
                                                                    ? "bg-red-500 border-red-500 text-white"
                                                                    : isSelected
                                                                      ? "border-teal-500 text-teal-600"
                                                                      : "border-gray-300 text-gray-500"
                                                                }`}
                                                            >
                                                              {isCorrectOption ? "✓" : isWrongSelection ? "✕" : i + 1}
                                                            </span>
                                                            <span className="text-sm font-medium">{opt}</span>
                                                          </button>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                  {(userAns != null || correct != null) && (
                                                    <div className="flex flex-wrap items-center text-[12px] text-gray-700 gap-2 mt-1">
                                                      {userAns != null && (
                                                        <span>
                                                          Your answer: <strong>{String(userAns)}</strong>
                                                        </span>
                                                      )}
                                                      {userAns != null && correct != null && (
                                                        <span
                                                          className={`px-2 py-0.5 rounded-full font-semibold ${isCorrect
                                                              ? "bg-teal-100 text-teal-700"
                                                              : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                          {isCorrect ? "Correct" : "Wrong"}
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                            {(quiz.questions || []).length === 0 && (
                                              <p className="text-xs text-gray-500">No questions available yet.</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {quizCount === 0 && (
                                <div className="px-3 py-3 text-xs text-gray-500">No quizzes yet.</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-600 uppercase">Student Feedback</p>
                  <h3 className="text-xl font-bold text-gray-900">Leave your review</h3>
                  <p className="text-sm text-gray-600">Reviews show instantly and help future students.</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold">
                  {displayReviewsCount} reviews
                </span>
              </div>

              {canComment ? (
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-gray-700 font-semibold mb-1 block">Your comment</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your experience with this course..."
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div className="w-full md:w-40">
                      <label className="text-sm text-gray-700 font-semibold mb-1 block">Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setReviewRating(n)}
                            className="p-1"
                            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                          >
                            <svg
                              className={`w-6 h-6 transition ${n <= reviewRating ? "text-amber-400" : "text-gray-300"}`}
                              viewBox="0 0 24 24"
                              fill={n <= reviewRating ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      {submittingReview ? "Submitting..." : "Add review"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-teal-200 rounded-xl p-4 bg-teal-50/60 text-sm text-teal-800">
                  You need to purchase the course to leave a review.
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 && (
                  <div className="text-sm text-gray-500">No reviews yet.</div>
                )}
                {reviews.map((rev) => (
                  <div key={rev.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/70">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-gray-900">{rev.userName || "Student"}</div>
                      <span className="text-[11px] text-gray-500">{fmtDate(rev.createdAt)}</span>
                    </div>
                    {rev.rating != null && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mb-1">
                        <span>Rating:</span>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <svg
                            key={n}
                            className={`w-4 h-4 ${n <= Number(rev.rating) ? "text-amber-400" : "text-gray-300"}`}
                            viewBox="0 0 24 24"
                            fill={n <= Number(rev.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-800 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!fromPaymentSuccess && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
                {!isEnrolled && (
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-3xl font-bold text-teal-600">${displayPrice}</span>
                    </div>
                    <p className="text-gray-500">One-time payment</p>
                  </div>
                )}

                {!uid && (
                  <div className="mb-3 text-xs text-gray-600 text-center">
                    Please sign in to proceed to checkout.
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => {
                      if (isEnrolled) {
                        navigate(`/courses/${course.id}`, { state: { fromPaymentSuccess: true } });
                        return;
                      }
                      if (requireLoginForPayment()) return;
                      navigate(`/checkout/${course.id}`);
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${isEnrolled
                        ? "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 hover:shadow-xl hover:-translate-y-1 transform"
                        : "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 hover:shadow-xl hover:-translate-y-1 transform"
                      }`}
                  >
                    {isEnrolled ? "View Course" : "Enroll Now"}
                  </button>
                  {!isEnrolled && (
                    <button
                      type="button"
                      onClick={toggleCart}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${inCart
                          ? "bg-teal-600 border-teal-600 text-white shadow-[0_8px_20px_rgba(13,148,136,0.2)] hover:bg-teal-700"
                          : "border-teal-600 text-teal-700 hover:bg-teal-50 hover:shadow-[0_6px_16px_rgba(13,148,136,0.12)]"
                        }`}
                      title={inCart ? "Remove from cart" : "Add to cart"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Access</span>
                    <span className="font-medium">Lifetime</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium">{courseFormatLabel}</span>
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
