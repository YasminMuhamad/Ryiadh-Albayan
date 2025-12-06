import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import toast from "react-hot-toast";

const MAX_RECOMMENDATIONS = 4;
const MAX_VOCAB = 32;

const tokenize = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z\u0600-\u06FF0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const buildVocab = (courses) => {
  const freq = new Map();
  courses.forEach((c) => {
    const tokens = [
      ...tokenize(c.title),
      ...tokenize(c.description),
      ...tokenize(c.category),
    ];
    tokens.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1));
  });
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_VOCAB)
    .map(([t]) => t);
};

const vectorize = (course, vocab) => {
  const tokens = new Set([
    ...tokenize(course.title),
    ...tokenize(course.description),
    ...tokenize(course.category),
  ]);
  return vocab.map((t) => (tokens.has(t) ? 1 : 0));
};

export default function CourseRecommendations({ courses, enrolledIds = [], cartIds = [] }) {
  const navigate = useNavigate();
  const [tfReady, setTfReady] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localCart, setLocalCart] = useState(cartIds);

  useEffect(() => {
    setLocalCart(cartIds);
  }, [cartIds]);

  // Wait for TF.js script to load (global)
  useEffect(() => {
    let cancelled = false;
    const checkTf = () => {
      if (typeof window !== "undefined" && window.tf) {
        if (!cancelled) setTfReady(true);
      } else {
        setTimeout(checkTf, 150);
      }
    };
    checkTf();
    return () => {
      cancelled = true;
    };
  }, []);

  const vocab = useMemo(() => buildVocab(courses), [courses]);

  useEffect(() => {
    if (!tfReady || !courses.length || !vocab.length) return;

    const tf = window.tf;
    setLoading(true);

    const run = () => {
      try {
        const matrix = tf.tensor2d(
          courses.map((c) => vectorize(c, vocab)),
          [courses.length, vocab.length],
          "float32"
        );

        const enrolledIdx = courses
          .map((c, idx) => (enrolledIds.includes(c.id) ? idx : -1))
          .filter((i) => i >= 0);

        // Fallback: if no enrollments, use top-rated
        if (enrolledIdx.length === 0) {
          const sorted = [...courses]
            .filter((c) => !enrolledIds.includes(c.id))
            .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
            .slice(0, MAX_RECOMMENDATIONS);
          setRecommended(sorted);
          matrix.dispose();
          return;
        }

        const pref = tf.tidy(() => {
          const gathered = tf.gather(matrix, tf.tensor1d(enrolledIdx, "int32"));
          return gathered.mean(0);
        });

        const prefNorm = tf.tidy(() => {
          const denom = tf.norm(pref).add(1e-6);
          return pref.div(denom);
        });

        const sim = tf.tidy(() => {
          const norms = tf.norm(matrix, "euclidean", 1).add(1e-6);
          const normed = matrix.div(norms.expandDims(1));
          return normed
            .matMul(prefNorm.expandDims(1))
            .reshape([courses.length])
            .arraySync();
        });

        const scored = courses
          .map((c, idx) => ({
            ...c,
            score: sim[idx] ?? 0,
          }))
          .filter((c) => !enrolledIds.includes(c.id));

        scored.sort((a, b) => b.score - a.score || (Number(b.rating) || 0) - (Number(a.rating) || 0));
        setRecommended(scored.slice(0, MAX_RECOMMENDATIONS));

        pref.dispose();
        prefNorm.dispose();
        matrix.dispose();
      } catch (err) {
        console.error("TF recommender failed", err);
        toast.error("Recommendation engine is currently unavailable.");
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [tfReady, courses, vocab, enrolledIds]);

  if (!tfReady) {
    return null;
  }

  return (
    <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recommended for you</h3>
          <p className="text-sm text-gray-500">Based on your enrolled courses and interests</p>
        </div>
        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2" />
            Updating
          </div>
        )}
      </div>

      {recommended.length === 0 ? (
        <p className="text-sm text-gray-600">Sign in and enroll to see tailored picks.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommended.map((course) => (
            <div
              key={course.id}
              className="border border-gray-100 rounded-3xl p-4 hover:shadow-md transition cursor-pointer overflow-hidden bg-white"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="flex gap-4 items-start">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0">
                  <img
                    src={course.thumbnail || course.image || "/api/placeholder/300/300"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/300/300";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="bg-amber-100 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                      {course.category || "Course"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-lg">{course.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {course.description || "Hand-picked for you."}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xl font-bold text-teal-600">
                  ${typeof course.price === "number" ? course.price : course.price || "—"}
                </span>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.id}`);
                    }}
                    className="px-6 py-2.5 bg-white hover:bg-amber-200 text-black hover:text-black rounded-full text-sm font-medium transition-colors border border-gray-200 hover:border-amber-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                      let updated;
                      if (localCart.includes(course.id)) {
                        updated = cart.filter((id) => id !== course.id);
                        toast("Removed from cart");
                      } else {
                        updated = Array.from(new Set([...cart, course.id]));
                        toast.success("Added to cart");
                      }
                      localStorage.setItem("cart", JSON.stringify(updated));
                      setLocalCart(updated);
                      window.dispatchEvent(new Event("cartUpdated"));
                    }}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      localCart.includes(course.id)
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
