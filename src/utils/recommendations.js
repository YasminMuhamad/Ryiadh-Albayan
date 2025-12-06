import { getDocs, collection } from "firebase/firestore";
import { db } from "../services/firebase";

// Normalize numeric features into 0-1
const normalize = (value, min, max) => {
  if (value == null || Number.isNaN(value)) return 0;
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

// Build a feature vector: [category one-hot..., rating, price, isLive]
const buildCourseVector = (course, categories, priceRange) => {
  const vector = new Array(categories.length + 3).fill(0);
  const categoryIndex = categories.indexOf(course.category || "unknown");
  if (categoryIndex >= 0) vector[categoryIndex] = 1;

  const rating = Number(course.rating) || 0;
  const price = typeof course.price === "number" ? course.price : parseFloat(course.price || "0");
  const isLive = course.type === "live" ? 1 : 0;

  vector[categories.length] = normalize(rating, 0, 5);
  vector[categories.length + 1] = normalize(price, priceRange.min, priceRange.max);
  vector[categories.length + 2] = isLive;
  return vector;
};

export const fetchStudentEnrollments = async (uid) => {
  if (!uid) return [];
  const snap = await getDocs(collection(db, "users", uid, "enrollments"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Main recommendation logic using TensorFlow.js for cosine similarity
// Load TensorFlow.js from window if present; otherwise from CDN (so build doesn't need the npm package)
const loadTf = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    if (typeof window !== "undefined" && window.tf) {
      promise = Promise.resolve(window.tf);
      return promise;
    }
    promise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-tfjs-cdn="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.tf));
        existing.addEventListener("error", () => reject(new Error("Failed to load tfjs CDN script")));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
      script.async = true;
      script.setAttribute("data-tfjs-cdn", "true");
      script.onload = () => resolve(window.tf);
      script.onerror = () => reject(new Error("Failed to load tfjs CDN script"));
      document.head.appendChild(script);
    });
    return promise;
  };
})();

export const generateCourseRecommendations = async ({
  courses,
  enrollments,
  limit = 3,
}) => {
  if (!Array.isArray(courses) || courses.length === 0) return [];

  const enrolledIds = new Set((enrollments || []).map((e) => e.courseId));
  const available = courses.filter((c) => !enrolledIds.has(c.id));
  if (available.length === 0) return [];

  // collect categories and price range
  const categories = Array.from(
    new Set(courses.map((c) => c.category || "unknown"))
  );
  const prices = courses
    .map((c) => (typeof c.price === "number" ? c.price : parseFloat(c.price || "0")))
    .filter((n) => !Number.isNaN(n));
  const priceRange = {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 1,
  };

  // dynamic load from CDN/window without bundler resolution
  let tf;
  try {
    tf = await loadTf();
  } catch (err) {
    console.error("Failed to load TensorFlow.js, falling back to rating sort:", err);
    return available
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, limit);
  }

  const courseVectors = available.map((c) =>
    buildCourseVector(c, categories, priceRange)
  );

  // user profile = mean of enrolled course vectors; if none, fallback to average of all
  const enrolledCourses = courses.filter((c) => enrolledIds.has(c.id));
  const profileSource = enrolledCourses.length ? enrolledCourses : courses.slice(0, 5);
  const userVectorRaw = profileSource.map((c) =>
    buildCourseVector(c, categories, priceRange)
  );
  const userVector = tf.tensor(userVectorRaw).mean(0, true); // shape [1, features]

  const courseTensor = tf.tensor(courseVectors); // [n, features]
  const dot = tf.matMul(courseTensor, userVector, false, true).reshape([-1]); // [n]
  const courseNorm = tf.norm(courseTensor, "euclidean", 1);
  const userNorm = tf.norm(userVector);
  const scores = tf.divNoNan(dot, tf.mul(courseNorm, userNorm));
  const scoresArr = await scores.array();

  tf.dispose([userVector, courseTensor, dot, courseNorm, userNorm, scores]);

  const ranked = available
    .map((course, idx) => ({ course, score: scoresArr[idx] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({ ...r.course, aiScore: r.score }));

  return ranked;
};
