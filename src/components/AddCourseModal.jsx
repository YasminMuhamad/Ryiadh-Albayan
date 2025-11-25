import React, { useEffect, useState } from "react";
import { Button } from "./Button";
import { X } from "lucide-react";
import { db } from "../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { CustomSelect } from "./CustomSelect";

export function AddCourseModal({ isOpen, onClose, teachers = [], terms = [], onSave, course }) {
    const [title, setTitle] = useState("");
    const [titleAr, setTitleAr] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [materials, setMaterials] = useState([]);
    const [videos, setVideos] = useState([]);
    const [thumbnail, setThumbnail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        if (course) {
            setTitle(course.title ?? "");
            setTitleAr(course.title_ar ?? course.titleAr ?? "");
            setDescription(course.description ?? "");
            setPrice(course.price != null ? String(course.price) : "");
            setTeacherId(course.teacherId ?? course.teacher ?? "");
            setThumbnail(course.thumbnail ?? "");
            // optionally materials/videos if present:
            //   setMaterials(course.materials ?? []);
            //   setVideos(course.videos ?? []);
            setErrors({});
        } else {
            // creating new course: reset fields
            setTitle("");
            setTitleAr("");
            setDescription("");
            setPrice("");
            setTeacherId("");
            setThumbnail("");
            //   setMaterials([]);
            //   setVideos([]);
            setErrors({});
        }
    }, [course, isOpen]);

    if (!isOpen) return null;

    const resetState = () => {
        setTitle("");
        setTitleAr("");
        setDescription("");
        setPrice("");
        setTeacherId("");
        // setMaterials([]);
        // setVideos([]);
        setThumbnail("");
        setErrors({});
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const validateField = (name, value) => {
        let message = "";
        if (!value || !value.toString().trim()) message = "This field is required";
        setErrors(prev => ({ ...prev, [name]: message }));
        return message === "";
    };

    const validateAll = () => {
        const v1 = validateField("title", title);
        const v2 = validateField("titleAr", titleAr);
        const v3 = validateField("description", description);
        const v4 = validateField("price", price);
        const v5 = validateField("teacherId", teacherId);
        return v1 && v2 && v3 && v4 && v5;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);
        try {
            const payload = {
                ...(course?.id ? { id: course.id } : {}),
                title: title.trim(),
                title_ar: titleAr.trim(),
                description: description.trim(),
                price: Number(price) || 0,
                teacherId,
                status: "Active",
                // materials,
                // videos,
                thumbnail,
                createdAt: new Date()
            }; if (typeof onSave === "function") {
                await onSave(payload);
            } else {
                // fallback: write directly to firestore
                if (course?.id) {
                    await updateDoc(doc(db, "courses", course.id), {
                        title: title.trim(),
                        title_ar: titleAr.trim(),
                        description: description.trim(),
                        price: Number(price) || 0,
                        teacherId,
                        status: "Active",
                        // materials,
                        // videos,
                        thumbnail,
                        createdAt: new Date()
                    });
                } else {
                    await addDoc(collection(db, "courses"), {
                        title: title.trim(),
                        title_ar: titleAr.trim(),
                        description: description.trim(),
                        price: Number(price) || 0,
                        teacherId,
                        status: "Active",
                        // materials,
                        // videos,
                        thumbnail,
                        createdAt: new Date()
                    });
                }
            }
            resetState();
        } catch (err) {
            console.error("Error adding course:", err);
            alert("Failed to add course. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-3xl w-[550px] relative max-h-[100vh]">
                <X
                    onClick={handleClose}
                    className="absolute top-5 right-5 w-6 h-6 text-gray-500 hover:text-gray-600 cursor-pointer"
                />
                <h2 className="text-lg mb-1 font-bold">Create New Course</h2>
                <p className="text-gray-500 pb-6">إضافة كورس</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Course Title */}
                    <div>
                        <label>Course Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => validateField("title", title)}
                            className={`w-full p-2 border ${errors.title ? "border-red-400" : "border-[#DBE9E5]"} rounded-xl`}
                        />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>

                    <div>
                        <label>عنوان الكورس</label>
                        <input
                            type="text"
                            value={titleAr}
                            onChange={(e) => setTitleAr(e.target.value)}
                            onBlur={() => validateField("titleAr", titleAr)}
                            dir="rtl"
                            className={`w-full p-2 border ${errors.titleAr ? "border-red-400" : "border-[#DBE9E5]"} rounded-xl text-right`}
                        />
                        {errors.titleAr && <p className="text-red-500 text-sm">{errors.titleAr}</p>}
                    </div>

                    <div>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => validateField("description", description)}
                            className={`w-full p-2 border ${errors.description ? "border-red-400" : "border-[#DBE9E5]"} rounded-xl`}
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>

                    <div>
                        <label>Price EGP</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            onBlur={() => validateField("price", price)}
                            className={`w-full p-2 border ${errors.price ? "border-red-400" : "border-[#DBE9E5]"} rounded-xl`}
                        />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                    </div>

                    <div>
                        <label>Teacher</label>
                        <CustomSelect
                            options={teachers.map(t => ({ value: t.id, label: t.name_en }))}
                            value={teacherId}
                            onChange={(val) => { setTeacherId(val); validateField("teacherId", val); }}
                            placeholder="Select teacher"
                        />
                        {errors.teacherId && <p className="text-red-500 text-sm">{errors.teacherId}</p>}
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label>Course Thumbnail URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/thumbnail.jpg"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            className="w-full p-2 border border-[#DBE9E5] rounded-xl"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>Cancel</Button>
                        <Button type="submit" onClick={handleSubmit} className="btn-primary" disabled={loading}>
                            {loading ? "Saving..." : (course ? "Save" : "Create")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}