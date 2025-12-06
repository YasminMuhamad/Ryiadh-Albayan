import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.config";
import CategoryDropdown from "../../components/categorydropdown";
import CourseRecommendations from "../../components/CourseRecommendations";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";


const normalizeReviews = (reviews) => {
  if (Array.isArray(reviews)) return reviews;
  if (reviews && typeof reviews === "object") return Object.values(reviews);
  return [];
};

const computeAverageRating = (rawReviews = []) => {
  const reviews = normalizeReviews(rawReviews);
  if (!reviews.length) return 0;
  const nums = reviews
    .map((r) => (typeof r?.rating === "number" ? r.rating : parseFloat(r?.rating)))
    .filter((n) => !Number.isNaN(n));
  if (!nums.length) return 0;
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return Number((sum / nums.length).toFixed(1));
};

export default function Courses() {
  const navigate = useNavigate();
  const { uid, role, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState(["All Categories"]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeSegment, setActiveSegment] = useState("recorded");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesSnapshot, teachersSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "teachers")),
          getDocs(collection(db, "categories")),
        ]);

        const categoriesMap = categoriesSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[doc.id] = data.title || data.name || doc.id;
          return acc;
        }, {});

        const coursesWithDoc = coursesSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));

        // Fetch subcollection reviews per course (only IDs we have)
        const reviewsByCourse = {};
        await Promise.all(
          coursesWithDoc.map(async ({ id }) => {
            try {
              const snap = await getDocs(collection(db, "courses", id, "reviews"));
              reviewsByCourse[id] = snap.docs.map((d) => d.data()).filter(Boolean);
            } catch (err) {
              reviewsByCourse[id] = [];
              console.error("Failed to fetch reviews for course", id, err);
            }
          })
        );

        const coursesList = coursesWithDoc
          .map(({ id, data }) => {
            const processedData = { ...data };
            const reviews = reviewsByCourse[id] || [];
            processedData.rating = computeAverageRating(reviews);
            processedData.reviewsCount = reviews.length;

            const categoryId = data.categoryId || data.category;
            const categoryLabel = categoriesMap[categoryId] || data.category || "Course";
            processedData.categoryId = categoryId;
            processedData.category = categoryLabel;

            if (data.createdAt && typeof data.createdAt === "object" && data.createdAt.toDate) {
              processedData.createdAt = data.createdAt.toDate().toISOString();
            }

            Object.keys(processedData).forEach((key) => {
              const value = processedData[key];
              if (value && typeof value === "object" && !Array.isArray(value)) {
                if (value.toDate && typeof value.toDate === "function") {
                  processedData[key] = value.toDate().toISOString();
                } else if (value.toString && typeof value.toString === "function") {
                  processedData[key] = value.toString();
                }
              }
            });

            return {
              id,
              ...processedData,
            };
          })
          .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));

        const teachersList = teachersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCourses(coursesList);
        setTeachers(teachersList);

        const uniqueCategories = Array.from(
          new Set(
            coursesList.map((c) => c.category).filter(Boolean)
          )
        );
        setCategories(["All Categories", ...uniqueCategories]);

        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!uid) {
        setEnrolledIds([]);
        return;
      }
      try {
        const snap = await getDocs(collection(db, "users", uid, "enrollments"));
        const ids = snap.docs.map((d) => d.data().courseId).filter(Boolean);
        setEnrolledIds(ids);
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      }
    };
    fetchEnrollments();
  }, [uid]);

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : "Unknown Teacher";
  };

  const toggleCart = (courseId) => {
    const updatedCart = cart.includes(courseId)
      ? cart.filter((id) => id !== courseId)
      : [...cart, courseId];

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    if (updatedCart.includes(courseId)) {
      toast.success("Added to cart");
    } else {
      toast("Removed from cart");
    }
  };

  const isInCart = (courseId) => cart.includes(courseId);

  const renderStars = (rating = 0) => {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(value);
    const hasHalf = value % 1 !== 0;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalf && (
          <svg key="half" className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <defs>
              <linearGradient id="half-star-courses">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star-courses)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z"
            />
          </svg>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const filtered = courses.filter((c) => {
    const matchCategory =
      selectedCategory === "All Categories" || c.category === selectedCategory;
    const matchSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const sortedFiltered = React.useMemo(() => {
    const isEnrolled = (id) => enrolledIds.includes(id);
    return [...filtered].sort((a, b) => {
      const aEn = isEnrolled(a.id);
      const bEn = isEnrolled(b.id);
      if (aEn !== bEn) return bEn - aEn; // enrolled first
      return (Number(b.rating) || 0) - (Number(a.rating) || 0); // then by rating desc
    });
  }, [filtered, enrolledIds]);

  const segmentedCourses = React.useMemo(() => {
    const recorded = [];
    const interactive = [];
    sortedFiltered.forEach((course) => {
      const type = (course.type || "recorded").toLowerCase();
      if (type === "recorded") recorded.push(course);
      else interactive.push(course);
    });
    return { recorded, interactive };
  }, [sortedFiltered]);

  const displayedCourses =
    activeSegment === "interactive"
      ? segmentedCourses.interactive
      : segmentedCourses.recorded;

  const formatCourseType = (type) => {
    const t = (type || "recorded").toString().toLowerCase();
    if (t.includes("interactive") || t.includes("live")) return "Interactive Session";
    return "Recorded Course";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading courses ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading courses: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mt-10">
        <h3 className="heading-1 flex justify-center">Explore Our Courses</h3>
        <p className="flex justify-center">Choose from our comprehensive selection of recorded courses and interactive live sessions</p>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-center gap-4 max-w-5xl mx-auto mt-10">
        <div className="flex items-center w-full bg-[#fdfbf7] rounded-full px-5  shadow-lg">
          <svg
            className="w-5 h-5 text-gray-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-transparent text-sm text-gray-600 placeholder:text-gray-400"
          />
        </div>

        <CategoryDropdown
      value={selectedCategory}
      categories={categories}
      onChange={setSelectedCategory}
    />
  </div>

      {/* Type Toggle */}
      <div className="max-w-3xl mx-auto mt-5">
        <div className="bg-[#f6f0e6] rounded-full p-[3px] flex shadow-inner border border-[#e7ddcf]">
          {[
            { key: "recorded", label: "Recorded Courses", count: segmentedCourses.recorded.length },
            { key: "interactive", label: "Interactive Sessions", count: segmentedCourses.interactive.length },
          ].map((opt) => {
            const isActive = activeSegment === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setActiveSegment(opt.key)}
                className={`flex-1 px-3.5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm border border-[#e9e0d2]"
                    : "text-gray-600 hover:text-gray-900 border border-transparent"
                }`}
              >
                {opt.label} ({opt.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
        {displayedCourses.map((course, idx) => (
          <div
            key={course.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${idx * 80}ms`, animationDuration: "0.8s" }}
          >
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out relative flex flex-col h-full hover:scale-105 hover:transform cursor-pointer">
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {formatCourseType(course.type)}
                </span>
              </div>

              <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                <img
                  src={course.thumbnail || "/api/placeholder/400/300"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
              </div>

              <div className="p-6 pb-8 flex flex-col flex-grow">
                <div className="mb-4">
                  <span className="bg-amber-100 text-black px-4 py-2 rounded-full text-sm font-medium">
                    {course.category || "Arabic Language"}
                  </span>
                </div>

                <h3 className="font-bold  mb-3 text-gray-900 leading-tight">
                  {course.title}
                </h3>

                <p className="text-gray-500 text-base mb-4 line-clamp-2 leading-relaxed flex-grow">
                  {course.description || "Learn Classical Arabic grammar (Nahw) from the ground up. Perfect for beginners wanting..."}
                </p>

                <p className="text-teal-600 font-medium text-base mb-6">
                  Instructor: {getTeacherName(course.teacherId) || "Dr. Fatima Al-Zahra"}
                </p>

                <div className="flex items-center gap-2 mb-6 text-gray-800">
                  <div className="flex items-center gap-1">
                    {renderStars(Number(course.rating) || 0)}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {Number(course.rating) ? Number(course.rating).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-gray-500 text-sm">({course.reviewsCount || 0} reviews)</span>
                </div>

                <div className="flex items-center gap-6 mb-8 text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-base">{course.totalLessons || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <span className="text-base">{course.totalModules || 0} modules</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xl font-bold text-teal-600">
                    $ {typeof course.price === "number" ? course.price : course.price || 149}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate(`/courses/${course.id}`, {
                          state: enrolledIds.includes(course.id) ? { fromPaymentSuccess: true } : {},
                        })
                      }
                      className={`px-8 py-3 rounded-full text-base font-medium transition-colors border ${
                        enrolledIds.includes(course.id)
                          ? "bg-teal-600 text-white hover:bg-teal-700 border-teal-600"
                          : "bg-white hover:bg-amber-200 text-black hover:text-black border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      {enrolledIds.includes(course.id) ? "View Course" : "Details"}
                    </button>
                    {!enrolledIds.includes(course.id) && (
                      <button
                        onClick={() => toggleCart(course.id)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isInCart(course.id)
                            ? "bg-teal-600 border-teal-600 text-white shadow-[0_8px_20px_rgba(13,148,136,0.2)] hover:bg-teal-700"
                            : "border-teal-600 text-teal-700 hover:bg-teal-50 hover:shadow-[0_6px_16px_rgba(13,148,136,0.12)]"
                        }`}
                        title="Add to cart"
                      >
                        <svg 
  xmlns="http://www.w3.org/2000/svg" 
  className="w-6 h-6" 
  fill="none" 
  viewBox="0 0 24 24" 
  stroke="currentColor" 
  strokeWidth="2"
>
  <path 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    d="M2 3h3l3.6 9.59a2 2 0 001.88 1.31H17a2 2 0 001.9-1.4l2.1-7H6" 
  />
  <circle cx="9" cy="20" r="1.5" />
  <circle cx="17" cy="20" r="1.5" />
</svg>

                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "All Categories"
              ? "Try adjusting your search or filter criteria."
            : "No courses are currently available."}
          </p>
        </div>
      )}

      {/* AI Recommendations at bottom */}

      {!authLoading && uid && role === "student" && (
        <div className="mt-12">
          <CourseRecommendations
            courses={courses}
            enrolledIds={enrolledIds}
            cartIds={cart}
          />
        </div>
      )}

    </div>
  );
}
