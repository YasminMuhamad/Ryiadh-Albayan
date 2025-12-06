import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { X } from 'lucide-react';
import { db } from "../../firebase.config";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { CustomSelect } from "./CustomSelect";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";
import { initializeApp as initializeAppSecondary } from "firebase/app";
import {
    getAuth as getAuthSecondary,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    inMemoryPersistence
} from "firebase/auth";
import { setDoc } from "firebase/firestore";
export function AddTeacherModal({ isOpen, onClose, teacher, onSave }) {
    const [specialization, setSpecialization] = useState("");
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [fullName, setFullName] = useState("");
    const [arabicName, setArabicName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const [errors, setErrors] = useState({
        fullName: "",
        arabicName: "",
        email: "",
        specialization: ""
    });

    useEffect(() => {
        if (!isOpen) return;
        if (teacher) {
            setFullName(teacher.name || "");
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

    useEffect(() => {
        if (!isOpen) return;

        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "categories"));
                const cats = snapshot.docs.map(doc => ({
                    value: doc.id,
                    label: doc.data().title
                }));
                setOptions(cats);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };

        fetchCategories();
    }, [isOpen]);

    if (!isOpen) return null;

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
        if (loading) return;
        if (!validateAll()) return;

        const trimmedEmail = email.trim().toLowerCase();
        setLoading(true);

        try {
            const q = query(collection(db, "teachers"), where("email", "==", trimmedEmail));
            const existing = await getDocs(q);
            if (!existing.empty) {
                const authMain = getAuth();
                await sendPasswordResetEmail(authMain, trimmedEmail);
                toast(`${trimmedEmail} already exists. Password reset email sent.`);
                resetState();
                onClose();
                return;
            }

            const secondaryConfig = {
                apiKey: "AIzaSyD9KLFnZmu4RwsFAgG_BX_psdAFofCOYyE",
                authDomain: "grad-project-b11d3.firebaseapp.com",
                databaseURL: "https://grad-project-b11d3-default-rtdb.firebaseio.com",
                projectId: "grad-project-b11d3",
                storageBucket: "grad-project-b11d3.firebasestorage.app",
                messagingSenderId: "744759817993",
                appId: "1:744759817993:web:191cb4ad7563291eec45d8",
                measurementId: "G-ZVENF1PYSB",
            };
            const secondaryAppName = `secondary-${Date.now()}`;
            const secondaryApp = initializeAppSecondary(secondaryConfig, secondaryAppName);

            const secondaryAuth = getAuthSecondary(secondaryApp);
            await setPersistence(secondaryAuth, inMemoryPersistence);

            const tempPassword = "temporary123";
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, trimmedEmail, tempPassword);
            const uid = userCred.user.uid;

            await setDoc(doc(db, "teachers", uid), {
                name: fullName.trim(),
                name_ar: arabicName.trim(),
                email: trimmedEmail,
                specialization: specialization || null,
                status: "Inactive",
                role: "teacher",
                profile_pic: "",
                uid,
                createdAt: new Date(),
            });

            const auth = getAuth();
            const actionCodeSettings = {
                // url: 'https://riyadh-albayan.com/reset-password',
                url: 'https://grad-project-b11d3.web.app/reset-password',
                handleCodeInApp: true,
            };

            await sendPasswordResetEmail(auth, trimmedEmail, actionCodeSettings);

            try {
                await secondaryApp.delete(); // available in newer SDKs; if not, just let it be GC'd
            } catch (e) {
                console.warn("secondary app delete:", e);
            }

            toast(`Teacher created and password reset email sent to ${trimmedEmail}.`);
            resetState();
            onClose();
        } catch (err) {
            console.error("Failed to create teacher:", err);
            if (err?.code === "auth/email-already-in-use") {
                toast("This email is already in use. Sent password reset where possible.");
            } else {
                toast("Failed to create teacher.");
            }
        } finally {
            setLoading(false);
        }
    };
    // Sends Reset Password شغال 
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (loading) return;
    //     if (!validateAll()) return;

    //     const trimmedEmail = email.trim().toLowerCase();
    //     setLoading(true);

    //     try {
    //         const auth = getAuth();

    //         // 1) تحقق سريع لو الايميل مسجل عند Firebase Auth
    //         const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);

    //         if (methods && methods.length > 0) {
    //             // الايميل موجود بالفعل في Auth
    //             // نرسل له رابط تغيير كلمة السر ونعلم الادمن بدل محاولة انشاء
    //             await sendPasswordResetEmail(auth, trimmedEmail);

    //             // (اختياري) - لو عايزة تخزني/تحدّثي doc في teachers عن وجود هذا الايميل:
    //             // ابحثي عن doc teachers بالإيميل ثم حدّثيه أو انشئي واحد لو مش موجود
    //             const q = query(collection(db, "teachers"), where("email", "==", trimmedEmail));
    //             const snapshot = await getDocs(q);
    //             if (snapshot.empty) {
    //                 // انشئ doc مع وضع status يوضح أن المستخدم موجود في Auth لكن doc لم يُنشأ بعد
    //                 await addDoc(collection(db, "teachers"), {
    //                     name: fullName.trim(),
    //                     name_ar: arabicName.trim(),
    //                     email: trimmedEmail,
    //                     specialization: specialization || null,
    //                     status: "Pending-Auth-Exists",
    //                     role: "teacher",
    //                     profile_pic: "",
    //                     createdAt: new Date(),
    //                 });
    //             } else {
    //                 // لو فيه doc موجود حدث الحالة
    //                 const docRef = snapshot.docs[0].ref;
    //                 await updateDoc(docRef, { status: "Auth-Exists" });
    //             }

    //             alert(`${trimmedEmail} already exists. Sent password reset email instead.`);
    //             resetState();
    //             onClose();
    //             return;
    //         }

    //         // 2) الايميل مش موجود — انشئ حساب مؤقت في Auth
    //         const tempPassword = "temporary123"; // يمكن تغييره أو توليده عشوائياً
    //         const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, tempPassword);
    //         const uid = userCred.user.uid;

    //         // 3) خزن بيانات المدرس في Firestore باستخدام uid (مفضل استخدام setDoc مع uid كـ id)
    //         await setDoc(doc(db, "teachers", uid), {
    //             name: fullName.trim(),
    //             name_ar: arabicName.trim(),
    //             email: trimmedEmail,
    //             specialization: specialization || null,
    //             status: "Inactive",
    //             role: "teacher",
    //             profile_pic: "",
    //             uid,
    //             createdAt: new Date(),
    //         });

    //         // 4) ابعث رابط إعادة تعيين كلمة السر للمستخدم ليغيّر الباسورد بنفسه
    //         await sendPasswordResetEmail(auth, trimmedEmail);

    //         alert(`Teacher created and password reset email sent to ${trimmedEmail}.`);
    //         resetState();
    //         onClose();
    //     } catch (err) {
    //         console.error("Failed to create teacher:", err);
    //         // رسائل أكثر ودية اعتماداً على نوع الخطأ
    //         if (err.code === "auth/email-already-in-use") {
    //             alert("هذا الإيميل مستخدم بالفعل. أرسلت رابط استعادة كلمة السر إذا أمكن.");
    //         } else {
    //             alert("فشل إنشاء المدرس. تحقق من الكونسول لمعرفة التفاصيل.");
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Basic Create Teacher
    // const handleSubmit = async (e) => {
    //     if (loading) return;
    //     e.preventDefault();

    //     if (!validateAll()) return;

    //     const trimmedEmail = email.trim().toLowerCase();
    //     setLoading(true);

    //     try {
    //         // --- 1) Check for duplicate email ---
    //         const q = query(collection(db, "teachers"), where("email", "==", trimmedEmail));
    //         const snapshot = await getDocs(q);

    //         if (!snapshot.empty) {
    //             const emailOwnerId = snapshot.docs[0].id;

    //             if (!teacher?.id || teacher.id !== emailOwnerId) {
    //                 setErrors((prev) => ({ ...prev, email: "Email already exists" }));
    //                 setLoading(false);
    //                 return;
    //             }
    //         }

    //         // --- 2) Prepare payload ---
    //         const payload = {
    //             ...(teacher?.id ? { id: teacher.id } : {}),
    //             name: fullName.trim(),
    //             name_ar: arabicName.trim(),
    //             email: trimmedEmail,
    //             specialization: specialization || null,
    //         };

    //         // --- 3) Call onSave from parent (if provided) ---
    //         if (typeof onSave === "function") {
    //             await onSave(payload);
    //         } else {
    //             // fallback: write directly to firestore
    //             if (teacher?.id) {
    //                 await updateDoc(doc(db, "teachers", teacher.id), {
    //                     name: fullName.trim(),
    //                     name_ar: arabicName.trim(),
    //                     email: trimmedEmail,
    //                     specialization: specialization || null,
    //                 });
    //             } else {
    //                 await addDoc(collection(db, "teachers"), {
    //                     name: fullName.trim(),
    //                     name_ar: arabicName.trim(),
    //                     email: trimmedEmail,
    //                     specialization: specialization || null,
    //                     status: "Inactive",
    //                     role: "teacher",
    //                     profile_pic: "",
    //                     createdAt: new Date(),
    //                 });
    //             }
    //         }

    //         // --- 4) Reset internal state ---
    //         resetState();
    //     } catch (err) {
    //         console.error("Error in modal handleSubmit:", err);
    //         alert("Failed to save teacher. Try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Test Send Signin Link Works
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (loading) return;
    //     if (!validateAll()) return;

    //     const trimmedEmail = email.trim().toLowerCase();
    //     setLoading(true);

    //     const auth = getAuth();
    //     const actionCodeSettings = {
    //         url: 'https://riyadh-albayan.com/finish-signup',
    //         handleCodeInApp: true,
    //     };

    //     try {
    //         await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);
    //         window.localStorage.setItem('teacherEmailForSignIn', trimmedEmail);
    //         alert(`Invitation link sent to ${trimmedEmail}`);
    //         resetState();
    //         onClose();
    //     } catch (err) {
    //         console.error(err);
    //         alert("Failed to send invitation link");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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
                            disabled={teacher && teacher.status === "Active"}
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
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="btn-primary flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : teacher ? "Save" : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}