import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase.config";
import "../../styles/globals.css";

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
  const [editing, setEditing] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [formData, setFormData] = useState(null);

  /* -------------------- Theme + Language States -------------------- */
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  /* -------------------- Apply Theme to HTML -------------------- */
  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  /* -------------------- Load Teacher From Firestore -------------------- */
  useEffect(() => {
    const loadTeacher = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "teachers", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        const mapped = {
          name: data.name,
          email: data.email,
          bio: data.specialization || "",
          avatar: data.profile_pic,
        };

        setTeacher(mapped);
        setFormData(mapped);
      }
    };

    loadTeacher();
  }, []);

  /* -------------------- Handle Inputs -------------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* -------------------- Save Changes to Firestore -------------------- */
  const saveChanges = async () => {
    const user = auth.currentUser;
    const ref = doc(db, "teachers", user.uid);

    await updateDoc(ref, {
      name: formData.name,
      email: formData.email,
      specialization: formData.bio,
      profile_pic: formData.avatar,
    });

    setTeacher(formData);
    setEditing(false);
  };

  /* -------------------- Loader Before Data Arrives -------------------- */
  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 flex flex-col items-center">

      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-xl">

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <img
            src={teacher.avatar}
            alt="Teacher Avatar"
            className="w-28 h-28 rounded-full border shadow-md object-cover"
          />
          <h2 className="mt-3 text-2xl font-semibold">{teacher.name}</h2>
          <p className="text-gray-600">{teacher.email}</p>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-1">About</h3>
          <p className="text-gray-700">{teacher.bio}</p>
        </div>

        {/* Edit Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-xl mt-6">
        <h3 className="text-xl font-semibold mb-4">Settings</h3>

        {/* Theme */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Theme</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" value="light" checked={theme === "light"} onChange={() => setTheme("light")} />
              Light
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" value="dark" checked={theme === "dark"} onChange={() => setTheme("dark")} />
              Dark
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="theme" value="system" checked={theme === "system"} onChange={() => setTheme("system")} />
              System
            </label>
          </div>
        </div>

        {/* Language */}
        <div>
          <h4 className="text-lg font-medium mb-2">Language</h4>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="language" value="en" checked={language === "en"} onChange={() => setLanguage("en")} />
              English
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name="language" value="ar" checked={language === "ar"} onChange={() => setLanguage("ar")} />
              العربية
            </label>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
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
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Bio</span>
                <textarea
                  name="bio"
                  value={formData.bio}
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
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={saveChanges}>Save</Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

