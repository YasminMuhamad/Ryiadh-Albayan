import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyCourses() {
  const { uid, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchased = async () => {
      const effectiveUid = uid || user?.uid;
      if (!effectiveUid) {
        setPurchasedCourses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const allCourses = [];
        try {
          const qPayments = query(collection(db, "payments"), where("studentId", "==", effectiveUid));
          const snap = await getDocs(qPayments);
          snap.docs.forEach((d) => {
            const courses = d.data().courses || [];
            courses.forEach((c) => allCourses.push(c));
          });
        } catch (err) {
          console.error("Failed to fetch from payments", err);
        }

        // also pick up enrollments subcollection
        try {
          const enrollSnap = await getDocs(collection(db, "users", effectiveUid, "enrollments"));
          enrollSnap.docs.forEach((d) => {
            const data = d.data();
            if (data?.courseId) {
              allCourses.push({ id: data.courseId, title: data.title, category: data.category, price: data.price });
            }
          });
        } catch (err) {
          console.error("Failed to fetch enrollments", err);
        }

        // unique by id
        const uniqueMap = new Map();
        allCourses.forEach((c) => {
          if (c?.id && !uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
        });

        const ids = Array.from(uniqueMap.keys());
        const enriched = await Promise.all(
          ids.map(async (id) => {
            try {
              const courseDoc = await getDoc(doc(db, "courses", id));
              if (courseDoc.exists()) {
                return { id, ...courseDoc.data() };
              }
            } catch (err) {
              console.error("Course fetch failed", err);
            }
            return uniqueMap.get(id);
          })
        );

        setPurchasedCourses(enriched.filter(Boolean));
      } catch (err) {
        console.error("Failed to load purchased courses", err);
        setError("Unable to load your courses right now.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPurchased();
    }
  }, [uid, user, authLoading]);

  const heading = useMemo(() => {
    if (loading) return "Loading your courses...";
    if (!(uid || user?.uid)) return "Sign in to view your courses";
    if (purchasedCourses.length === 0) return "No courses purchased yet";
    return "My Courses";
  }, [loading, uid, user, purchasedCourses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading your courses...</span>
      </div>
    );
  }

  if (!authLoading && !(uid || user?.uid)) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{heading}</h1>
        <p className="text-gray-600">Please sign in to see the courses you purchased.</p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition shadow-sm"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
        <p className="text-gray-600">Access and continue watching the courses you’ve purchased.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {purchasedCourses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't purchased any courses yet.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purchasedCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/courses/${course.id}`, { state: { fromPaymentSuccess: true } })}
            >
              <div className="flex gap-3 items-start">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0">
                  <img
                    src={course.thumbnail || course.image || "/api/placeholder/200/200"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/200/200";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="bg-amber-100 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                      {course.category || "Course"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {course.description || "Continue your learning journey."}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-teal-600">
                  ${typeof course.price === "number" ? course.price : course.price || "—"}
                </span>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.id}`, { state: { fromPaymentSuccess: true } });
                    }}
                    className="px-5 py-2 bg-white hover:bg-amber-200 text-black hover:text-black rounded-full text-sm font-medium transition-colors border border-gray-200 hover:border-amber-300"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
