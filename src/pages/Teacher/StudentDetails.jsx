import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase.config";

export default function StudentDetailsPage({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const docRef = doc(db, "users", studentId); // collection "users"
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStudent({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("No such student!");
        }
      } catch (err) {
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false);
      }
    }

    if (studentId) fetchStudent();
  }, [studentId]);

  if (loading) return <p>Loading...</p>;
  if (!student) return <p>Student not found.</p>;

  return (
    <div className="p-6 font-sans space-y-6">
      <button
        className="px-3 py-1 border rounded-md text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
        onClick={onBack}
      >
        Back to Students
      </button>

      {/* Student Info */}
      <div className="bg-[var(--card)] rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src={student.profile_pic || "https://via.placeholder.com/80"}
            alt={student.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{student.name}</h1>
          <p className="text-gray-500">{student.email}</p>
          <p className="text-gray-500">Term: {student.term}</p>
          <p className="text-gray-500">Year: {student.year}</p>
          <p className="text-gray-500">Courses Count: {student.coursesCount}</p>
          <p className="text-gray-500">
            Subscription Status: {student.subscriptionStatus}
          </p>
          <p className="text-gray-500">
            Created At: {student.createdAt?.toDate().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
