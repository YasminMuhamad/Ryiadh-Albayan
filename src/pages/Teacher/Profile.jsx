import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/globals.css";
import { db } from "../../services/firebase";
import Sidebar from "../../components/TeacherSidebar.jsx";

// ---------------- Button ----------------
function Button({ children, variant = "default", ...props }) {
  const base = "px-4 py-2 rounded-md font-medium transition-all";
  const variants = {
    default: "bg-[var(--primary)] text-white hover:opacity-90",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default function TeacherProfile() {
  const { profile, uid } = useAuth();
  const [editing, setEditing] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadTeacher = async () => {
      if (!profile) return;

      const ref = doc(db, "teachers", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const mapped = {
          name: data.name || "",
          email: data.email || "",
          password: data.password || "",
          bio: data.specialization || "",
          about: data.about || "",
          avatar: data.profile_pic || "",
        };
        setTeacher(mapped);
        setFormData(mapped);
      }
    };

    loadTeacher();
  }, [profile, uid]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid.";
    if (!formData.password.trim())
      newErrors.password = "Password cannot be empty.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = async () => {
    if (!validate()) return;

    const ref = doc(db, "teachers", uid);

    await updateDoc(ref, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      specialization: formData.bio,
      about: formData.about,
      profile_pic: formData.avatar,
    });

    setTeacher(formData);
    setEditing(false);
  };

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-[var(--background)] p-6 flex flex-col items-center">
        {/* Profile Card */}
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-xl">
          <div className="flex flex-col items-center">
            <img
              src={teacher.avatar}
              alt="Teacher Avatar"
              className="w-28 h-28 rounded-full border shadow-md object-cover"
            />
            <h2 className="mt-3 text-2xl font-semibold">{teacher.name}</h2>
            <p className="text-gray-600">{teacher.email}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-1">Specialization</h3>
            <p className="text-gray-700">{teacher.bio}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-1">About</h3>
            <p className="text-gray-700">{teacher.about}</p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
          </div>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border rounded-md p-2"
                  />
                  {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border rounded-md p-2"
                  />
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="border rounded-md p-2"
                  />
                  {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Specialization</span>
                  <input
                    type="text"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="border rounded-md p-2"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">About</span>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    className="border rounded-md p-2"
                    rows="3"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">Avatar Image URL</span>
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="border rounded-md p-2"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={saveChanges}>Save</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}