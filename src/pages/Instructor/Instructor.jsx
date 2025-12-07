import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useNavigate } from "react-router-dom";

// استيراد الصور الافتراضية
import girl1 from "../../assets/images/girl1.avif";
import man from "../../assets/images/man.jpg";
import photo6 from "../../assets/images/photo6.jpg";

const defaultImages = [girl1, man, photo6];

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const snap = await getDocs(collection(db, "teachers"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // استبدال الصور الفارغة بصورة عشوائية من defaultImages
        const instructorsWithImages = data.map((teacher) => ({
          ...teacher,
          profile_pic: teacher.profile_pic || defaultImages[Math.floor(Math.random() * defaultImages.length)],
        }));

        setInstructors(instructorsWithImages);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading instructors ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading instructors: {error}</p>
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
      <div className="mt-10 text-center">
        <h3 className="heading-1">Our Instructors</h3>
        <p className="text-gray-600 mt-2">
          Meet our experienced instructors guiding you through your learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
        {instructors.map((teacher, idx) => (
          <div
            key={teacher.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${idx * 80}ms`, animationDuration: "0.8s" }}
          >
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out relative flex flex-col h-full hover:scale-105 cursor-pointer">
              {/* Image */}
              <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                <img
                  src={teacher.profile_pic}
                  alt={teacher.name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  onError={(e) => (e.target.src = defaultImages[Math.floor(Math.random() * defaultImages.length)])}
                />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{teacher.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{teacher.bio || "Experienced instructor guiding students in their learning journey."}</p>

                {teacher.specialty && (
                  <span className="bg-amber-100 text-black px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                    {teacher.specialty}
                  </span>
                )}

                <div className="mt-auto text-teal-600 font-semibold mb-4">
                  {teacher.coursesCount ? `${teacher.coursesCount} courses` : "No courses yet"}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/Instructors/${teacher.id}`)}
                  className="w-full py-2 rounded-full text-white bg-teal-600 hover:bg-teal-700 transition-colors font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {instructors.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No instructors available at the moment.
        </div>
      )}
    </div>
  );
}