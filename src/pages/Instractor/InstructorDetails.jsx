import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase.config";

// استيراد الصور الافتراضية
import girl1 from "../../assets/images/girl1.avif";
import man from "../../assets/images/man.jpg";
import photo6 from "../../assets/images/photo6.jpg";
const defaultImages = [girl1, man, photo6];

export default function InstructorsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        // Fetch instructor data
        const docSnap = await getDoc(doc(db, "teachers", id));
        if (!docSnap.exists()) throw new Error("Instructor not found");
        const data = docSnap.data();

        // اذا مفيش صورة نختار صورة عشوائية
        const profilePic =
          data.profile_pic || defaultImages[Math.floor(Math.random() * defaultImages.length)];

        setInstructor({ id: docSnap.id, ...data, profile_pic: profilePic });

        // Fetch courses of this instructor
        const coursesSnap = await getDocs(
          query(collection(db, "courses"), where("teacherId", "==", docSnap.id))
        );
        const coursesData = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCourses(coursesData);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading instructor details ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
        <div className="w-64 h-64 overflow-hidden rounded-3xl shadow-lg flex-shrink-0">
          <img
            src={instructor.profile_pic}
            alt={instructor.name}
            className="w-full h-full object-cover"
            onError={(e) =>
              (e.target.src = defaultImages[Math.floor(Math.random() * defaultImages.length)])
            }
          />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{instructor.name}</h2>
          {instructor.specialization && (
            <span className="bg-amber-100 text-black px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
              {instructor.specialization}
            </span>
          )}
          {instructor.bio && <p className="text-gray-600 mb-4">{instructor.bio}</p>}

          {/* Contact info */}
          <div className="flex flex-col md:flex-row gap-4">
            {instructor.email && (
              <a href={`mailto:${instructor.email}`} className="text-teal-600 hover:underline">
                Email: {instructor.email}
              </a>
            )}
            {instructor.phone && (
              <a href={`tel:${instructor.phone}`} className="text-teal-600 hover:underline">
                Phone: {instructor.phone}
              </a>
            )}
          </div>

          {/* Courses count */}
          <div className="mt-4 text-gray-700 font-semibold">
            {instructor.coursesCount ? `${instructor.coursesCount} courses` : "No courses yet"}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">Courses by {instructor.name}</h3>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {courses.map((course, idx) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out relative flex flex-col h-full hover:scale-105 cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${idx * 80}ms`, animationDuration: "0.8s" }}
              >
                <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                  <img
                    src={course.thumbnail || "/api/placeholder/400/300"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {course.description || "No description available"}
                  </p>
                  <div className="mt-auto text-teal-600 font-semibold mb-4">
                    $ {typeof course.price === "number" ? course.price : course.price || 149}
                  </div>
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full py-2 rounded-full text-white bg-teal-600 hover:bg-teal-700 transition-colors font-medium"
                  >
                    View Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No courses available for this instructor.</p>
        )}
      </div>
    </div>
  );
}
