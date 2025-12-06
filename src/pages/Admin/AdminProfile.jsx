import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Mail, UserCheck } from "lucide-react"; // أيقونات
import Loader from "../../components/Loader";

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const adminDoc = doc(db, "admins", "uuG8UyOLhJc9hMeZ4qYWtoCmWf32");
        const docSnap = await getDoc(adminDoc);
        if (docSnap.exists()) {
          setAdmin(docSnap.data());
        } else {
          console.log("No such admin!");
        }
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };
    fetchAdmin();
  }, []);

  if (!admin) return <Loader />;

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full border border-gray-200">
        {/* صورة الأدمن */}
        <div className="flex justify-center mb-6">
          <img
            className="w-28 h-28 rounded-full border-4 border-teal-600"
            src="/placeholder-avatar.png"
            alt="Admin Avatar"
          />
        </div>

        {/* معلومات الأدمن */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            {admin.name || "Admin Name"}
          </h2>

          {/* Role */}
          <div className="flex items-center gap-2 text-gray-800">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span className="font-medium">{admin.role}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-gray-800">
            <Mail className="w-5 h-5 text-teal-600" />
            <div>
              <p className="truncate">{admin.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                *This email cannot be changed in this version
              </p>
            </div>
          </div>

          {/* رسالة عامة */}
          <div className="mt-4 px-4 py-3 bg-teal-50 border-l-4 border-teal-600 text-teal-800 text-sm rounded shadow-sm flex items-center gap-2">
            ⚠️ Admin data is read-only in this version of the dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
