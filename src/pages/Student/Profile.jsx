// src/pages/Student/StudentProfile.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import toast from "react-hot-toast";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import DatePicker from "react-datepicker";
import { deleteUser } from "firebase/auth";
import { auth } from "../../services/firebase";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isValid } from "date-fns";
import { fmtDateOnly } from "../../utils/formatDate";
import ConfirmModal from "../../components/ConfirmModal";

export default function StudentProfile() {
  const { profile, uid } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // helper: convert profile.birthDate (maybe string) -> Date | null
  const toDate = (val) => {
    if (!val) return null;
    if (val instanceof Date && isValid(val)) return val;
    try {
      const parsed = typeof val === "string" ? parseISO(val) : new Date(val);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  // form state (keeps in sync with profile)
  const [form, setForm] = useState({
    name: profile?.name || "",
    name_ar: profile?.name_ar || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    birthDate: toDate(profile?.birthDate) || null, // Date or null
    gender: profile?.gender || "",
  });

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      name_ar: profile?.name_ar || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birthDate: toDate(profile?.birthDate) || null,
      gender: profile?.gender || "",
    });
  }, [profile]);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // autofocus ref for name input
  const nameRef = useRef(null);
  useEffect(() => {
    if (editMode && nameRef.current) {
      nameRef.current.focus();
    }
  }, [editMode]);

  if (!profile) return <p>Please login to view your profile.</p>;

  // unified field class for consistent size
  const fieldClass = "w-full border rounded px-3 py-2 bg-white text-gray-800 h-11 flex items-center";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleDateChange = (date) => {
    setForm((s) => ({ ...s, birthDate: date }));
  };

  // simple validators
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(String(email || "").trim());
  const isValidPhone = (phone) => {
    if (!phone) return true; // phone optional — change if required
    // accept digits, spaces, +, -, parentheses — at least 7 chars
    return /^[\d\s()+-]{7,}$/.test(String(phone).trim());
  };

  const handleSave = async () => {
    // basic client-side validations
    if (!form.name || form.name.trim().length < 2) {
      toast.error("Please enter a valid full name (at least 2 characters).");
      return;
    }
    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      toast.error("Please enter a valid phone number (digits and + allowed).");
      return;
    }

    setLoading(true);
    try {
      // prepare payload: convert Date -> yyyy-MM-dd string (or empty)
      const payload = {
        ...form,
        birthDate: form.birthDate ? format(form.birthDate, "yyyy-MM-dd") : "",
      };
      await updateDoc(doc(db, "users", uid), payload);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: profile?.name || "",
      name_ar: profile?.name_ar || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birthDate: toDate(profile?.birthDate) || null,
      gender: profile?.gender || "",
    });
    setEditMode(false);
    toast("Edit cancelled");
  };

  // segmented toggle for gender (accessible)
  const genders = [
    { key: "female", label: "Female" },
    { key: "male", label: "Male" },
  ];
  const handleDeleteAccount = async () => {
    try {
      // 1) احذف الدوكيومنت من Firestore
      await deleteDoc(doc(db, "users", uid));

      // 2) احذف اليوزر من Firebase Auth
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      toast.success("Your account has been deleted.");
      window.location.href = "/"; // رجعيه للهوم أو لصفحة تسجيل الدخول
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error("Error deleting account. Please re-login and try again.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <Card className="p-6 rounded-2xl shadow flex items-center justify-between bg-white border">
        <div className="flex items-center gap-4">
          <img
            src={profile.profile_pic || "/placeholder-avatar.png"}
            alt={profile.name ? `Avatar of ${profile.name}` : "Profile avatar"}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">{form.name || "Unnamed"}</h2>
            <p className="text-gray-500 text-sm">
              Joined: {fmtDateOnly(profile.createdAt) || "Not available"}
            </p>
            <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-[#E9D8A6]">
              {profile.subscriptionStatus || "Inactive"}
            </span>
          </div>
        </div>

        {/* Header buttons */}
        {!editMode ? (
          <Button
            className="btn-primary"
            onClick={() => setEditMode(true)}
            disabled={loading}
            aria-label="Edit profile"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              className="btn-primary flex items-center gap-2"
              onClick={handleSave}
              disabled={loading}
              aria-disabled={loading}
              aria-busy={loading}
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {loading ? "Saving..." : "Save"}
            </Button>

            <Button
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
              aria-label="Cancel editing"
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>

      {/* Personal Information Form */}
      <Card className="p-6 rounded-2xl shadow space-y-3 bg-white border">
        <h3 className="text-lg font-semibold">Personal Information</h3>

        {/* Name */}
        <div>
          <label className="text-xs text-gray-400" htmlFor="name">Full Name</label>
          {editMode ? (
            <input
              id="name"
              ref={nameRef}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`${fieldClass} bg-white`}
              aria-label="Full name"
            />
          ) : (
            <div className={`${fieldClass} bg-gray-50`} aria-hidden>
              {form.name || <span className="text-gray-400">—</span>}
            </div>
          )}
        </div>

        {/* Name Arabic */}
        <div>
          <label className="text-xs text-gray-400" htmlFor="name_ar">Full Name (Arabic)</label>
          {editMode ? (
            <input
              id="name_ar"
              type="text"
              name="name_ar"
              value={form.name_ar}
              onChange={handleChange}
              className={`${fieldClass} bg-white`}
              aria-label="Full name in Arabic"
            />
          ) : (
            <div className={`${fieldClass} bg-gray-50`} aria-hidden>
              {form.name_ar || <span className="text-gray-400">—</span>}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-gray-400" htmlFor="email">Email Address</label>
          {editMode ? (
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`${fieldClass} bg-white`}
              aria-label="Email address"
            />
          ) : (
            <div className={`${fieldClass} bg-gray-50`} aria-hidden>
              {form.email || <span className="text-gray-400">—</span>}
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs text-gray-400" htmlFor="phone">Phone Number</label>
          {editMode ? (
            <input
              id="phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`${fieldClass} bg-white`}
              aria-label="Phone number"
            />
          ) : (
            <div className={`${fieldClass} bg-gray-50`} aria-hidden>
              {form.phone || <span className="text-gray-400">—</span>}
            </div>
          )}
        </div>

        {/* Birth Date - DatePicker */}
        <div>
          <label className="text-xs text-gray-400" htmlFor="birthDate">Birth Date</label>

          {editMode ? (
            <DatePicker
              id="birthDate"
              selected={form.birthDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className={`${fieldClass} bg-white`}
              placeholderText="YYYY-MM-DD"
              aria-label="Birth date"
            />
          ) : (
            <div className={`${fieldClass} bg-gray-50`} aria-hidden>
              {form.birthDate ? format(form.birthDate, "yyyy-MM-dd") : <span className="text-gray-400">—</span>}
            </div>
          )}
        </div>

        {/* Gender — segmented toggle */}
        <div>
          <p className="text-xs text-gray-400">Gender</p>
          {editMode ? (
            <div role="tablist" aria-label="Gender" className="inline-flex rounded-full bg-gray-100 p-1 mt-2">
              {genders.map((g) => {
                const active = form.gender === g.key;
                return (
                  <button
                    key={g.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setForm((s) => ({ ...s, gender: g.key }))}
                    className={`px-3 py-1 rounded-full text-sm focus:outline-none ${active ? "bg-white shadow text-gray-900" : "text-gray-600"
                      }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`${fieldClass} bg-gray-50`} aria-hidden>
              {form.gender || <span className="text-gray-400">—</span>}
            </div>
          )}
        </div>

        {/* status region for assistive tech */}
        <div role="status" aria-live="polite" className="sr-only">
          {loading ? "Saving profile..." : ""}
        </div>
      </Card>
      {/* Delete Account Button */}
      <div className="text-right">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete My Account
        </button>
      </div>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
