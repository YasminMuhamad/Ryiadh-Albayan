import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { X } from 'lucide-react';
import { db } from "../../firebase.config";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { CustomSelect } from "./CustomSelect";

export function AddTeacherModal({ isOpen, onClose, teacher, onSave }) {
    const [specialization, setSpecialization] = useState("");
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [fullName, setFullName] = useState("");
    const [arabicName, setArabicName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        fullName: "",
        arabicName: "",
        email: "",
        specialization: ""
    });

    useEffect(() => {
        if (!isOpen) return;
        if (teacher) {
            setFullName(teacher.name_en || "");
            setArabicName(teacher.name_ar || "");
            setEmail(teacher.email || "");
            setSpecialization(teacher.specialization || "");
        } else {
            setFullName("");
            setArabicName("");
            setEmail("");
            setSpecialization("");
        }
    }, [teacher, isOpen]);

    if (!isOpen) return null;

    const options = [
        { value: "quranic_studies", label: "Quranic Studies" },
        { value: "hadith", label: "Hadith" },
        { value: "fiqh", label: "Fiqh" },
        { value: "arabic_language", label: "Arabic Language" },
        { value: "islamic_studies", label: "Islamic Studies" },
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const resetState = () => {
        setSpecialization("");
        setIsOpenDropdown(false);
        setFullName("");
        setArabicName("");
        setEmail("");
        setErrors({ fullName: "", arabicName: "", email: "", specialization: "" });
    };


    const handleClose = () => {
        resetState();
        onClose();
    };

    // validate single field and set error message
    const validateField = (name, value) => {
        let message = "";

        // make sure we treat non-string values safely (CustomSelect may return object)
        const safeValue = (typeof value === "string")
            ? value
            : (value && typeof value === "object")
                ? (value.value ?? value.label ?? "")
                : "";

        switch (name) {
            case "fullName":
                if (!safeValue || !safeValue.trim()) message = "This field is required";
                break;
            case "arabicName":
                if (!safeValue || !safeValue.trim()) message = "This field is required";
                break;
            case "email":
                if (!safeValue || !safeValue.trim()) {
                    message = "This field is required";
                } else if (!emailRegex.test(safeValue.trim())) {
                    message = "Invalid email format";
                }
                break;
            case "specialization":
                // keep specialization required? if you want it optional, remove this block
                if (!safeValue || !safeValue.trim()) message = "This field is required";
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: message }));
        return message === "";
    };

    // handlers that validate on change/blur
    const handleFullNameChange = (e) => {
        setFullName(e.target.value);
        if (errors.fullName) validateField("fullName", e.target.value);
    };

    const handleArabicNameChange = (e) => {
        setArabicName(e.target.value);
        if (errors.arabicName) validateField("arabicName", e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) validateField("email", e.target.value);
    };

    // IMPORTANT: CustomSelect might return an object {value,label} or string.
    // Normalize it here to always store a string in specialization.
    const handleSpecializationSelect = (val) => {
        const normalized =
            typeof val === "string" ? val
                : val && typeof val === "object" ? (val.value ?? val.label ?? "")
                    : "";
        setSpecialization(normalized);
        setIsOpenDropdown(false);
        validateField("specialization", normalized);
    };

    const validateAll = () => {
        const v1 = validateField("fullName", fullName);
        const v2 = validateField("arabicName", arabicName);
        const v3 = validateField("email", email);
        const v4 = validateField("specialization", specialization);
        return v1 && v2 && v3 && v4;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateAll()) return;

        const trimmedEmail = email.trim().toLowerCase();
        setLoading(true);

        try {
            // --- 1) Check for duplicate email ---
            const q = query(collection(db, "teachers"), where("email", "==", trimmedEmail));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const emailOwnerId = snapshot.docs[0].id;

                if (!teacher?.id || teacher.id !== emailOwnerId) {
                    setErrors((prev) => ({ ...prev, email: "Email already exists" }));
                    setLoading(false);
                    return;
                }
            }

            // --- 2) Prepare payload ---
            const payload = {
                ...(teacher?.id ? { id: teacher.id } : {}),
                name_en: fullName.trim(),
                name_ar: arabicName.trim(),
                email: trimmedEmail,
                specialization: specialization || null,
            };

            // --- 3) Call onSave from parent (if provided) ---
            if (typeof onSave === "function") {
                await onSave(payload);
            } else {
                // fallback: write directly to firestore
                if (teacher?.id) {
                    await updateDoc(doc(db, "teachers", teacher.id), {
                        name_en: fullName.trim(),
                        name_ar: arabicName.trim(),
                        email: trimmedEmail,
                        specialization: specialization || null,
                    });
                } else {
                    await addDoc(collection(db, "teachers"), {
                        name_en: fullName.trim(),
                        name_ar: arabicName.trim(),
                        email: trimmedEmail,
                        specialization: specialization || null,
                        status: "Inactive",
                        role: "teacher",
                        profile_pic: "",
                        createdAt: new Date(),
                    });
                }
            }

            // --- 4) Reset internal state ---
            resetState();
        } catch (err) {
            console.error("Error in modal handleSubmit:", err);
            alert("Failed to save teacher. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-3xl w-[550px] relative">
                <X
                    onClick={handleClose}
                    className="absolute top-5 right-5 w-6 h-6 text-gray-500 hover:text-gray-600 cursor-pointer"
                />
                <h2 className="text-lg mb-1 font-bold">Create New Teacher</h2>
                <p className="text-gray-500 pb-6">إضافة معلم</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div>
                        <label className="block mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            value={fullName}
                            onChange={handleFullNameChange}
                            onBlur={() => validateField("fullName", fullName)}
                            className={`w-full bg-[#F5F3ED] rounded-2xl p-2 border ${errors.fullName ? "border-red-400" : "border-[#DBE9E5]"} focus:outline-none focus:ring-2 focus:ring-[#0E7C7B]`}
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Arabic Name */}
                    <div>
                        <label className="block mb-1">الاسم بالعربية</label>
                        <input
                            type="text"
                            placeholder="أدخل الاسم بالعربية"
                            value={arabicName}
                            onChange={handleArabicNameChange}
                            onBlur={() => validateField("arabicName", arabicName)}
                            dir="rtl"
                            className={`w-full bg-[#F5F3ED] rounded-2xl p-2 border ${errors.arabicName ? "border-red-400" : "border-[#DBE9E5]"} text-right focus:outline-none focus:ring-2 focus:ring-[#0E7C7B]`}
                        />
                        {errors.arabicName && (
                            <p className="text-red-500 text-sm mt-1">{errors.arabicName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="teacher@example.com"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={() => validateField("email", email)}
                            className={`w-full bg-[#F5F3ED] rounded-2xl p-2 border ${errors.email ? "border-red-400" : "border-[#DBE9E5]"} focus:outline-none focus:ring-2 focus:ring-[#0E7C7B]`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Specialization */}
                    <div className="relative">
                        <label className="block mb-1">Specialization</label>
                        <CustomSelect
                            options={options}
                            value={specialization}
                            onChange={handleSpecializationSelect}
                            placeholder="Select specialization"
                        />
                        {errors.specialization && (
                            <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>Cancel</Button>
                        <Button type="submit" onClick={handleSubmit} className="btn-primary" disabled={loading}>
                            {loading ? "Saving..." : teacher ? "Save" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}