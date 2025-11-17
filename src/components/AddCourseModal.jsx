import React, { useState } from "react";
import { Button } from "./Button";
import { X } from "lucide-react";
import { db } from "../../firebase.config";
import { collection, addDoc } from "firebase/firestore";
// import { storage } from "../../firebase.config"; // لو عندك firebase.storage
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { CustomSelect } from "./CustomSelect";

export function AddCourseModal({ isOpen, onClose, teachers = [], terms = [] }) {
    const [title, setTitle] = useState("");
    const [titleAr, setTitleAr] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [termId, setTermId] = useState("");
    const [type, setType] = useState("");
    const [materialsFiles, setMaterialsFiles] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const courseTypes = [
        { value: "semester", label: "Semester" },
        { value: "year", label: "Year" },
        { value: "short", label: "Short Course" },
    ];

    const resetState = () => {
        setTitle(""); setTitleAr(""); setDescription(""); setPrice("");
        setTeacherId(""); setTermId(""); setType(""); setMaterialsFiles([]);
        setVideoFiles([]); setErrors({});
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
        const v6 = validateField("termId", termId);
        const v7 = validateField("type", type);
        return v1 && v2 && v3 && v4 && v5 && v6 && v7;
    };

    // Upload file to Firebase Storage and return URL
    const uploadFile = (file, folder) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                null,
                (error) => reject(error),
                () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);

        try {
            // Upload materials
            const materials = await Promise.all(
                Array.from(materialsFiles).map(async (file) => ({
                    title: file.name,
                    file: await uploadFile(file, "materials")
                }))
            );

            // Upload videos
            const videos = await Promise.all(
                Array.from(videoFiles).map(async (file) => ({
                    title: file.name,
                    url: await uploadFile(file, "videos")
                }))
            );

            // Add course to Firestore
            await addDoc(collection(db, "courses"), {
                title: title.trim(),
                title_ar: titleAr.trim(),
                description: description.trim(),
                price: Number(price),
                teacherId,
                // termId,
                // type,
                materials,
                videos,
                createdAt: new Date()
            });

            resetState();
            onClose();
        } catch (err) {
            console.error("Error adding course:", err);
            alert("Failed to add course. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-3xl w-[550px] relative max-h-[90vh] overflow-auto">
                <X
                    onClick={handleClose}
                    className="absolute top-5 right-5 w-6 h-6 text-gray-500 hover:text-gray-600 cursor-pointer"
                />
                <h2 className="text-lg mb-1 font-bold">Create New Course</h2>
                <p className="text-gray-500 pb-6">إضافة كورس</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
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

                    {/* <div>
                        <label>Term</label>
                        <CustomSelect
                            options={terms.map(t => ({ value: t.id, label: t.name }))}
                            value={termId}
                            onChange={(val) => { setTermId(val); validateField("termId", val); }}
                            placeholder="Select term"
                        />
                        {errors.termId && <p className="text-red-500 text-sm">{errors.termId}</p>}
                    </div> */}

                    {/* <div>
                        <label>Type</label>
                        <CustomSelect
                            options={courseTypes}
                            value={type}
                            onChange={(val) => { setType(val); validateField("type", val); }}
                            placeholder="Select type"
                        />
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                    </div> */}

                    {/* Materials */}
                    <div>
                        <label>Materials (PDF URLs, comma separated)</label>
                        <input
                            type="text"
                            placeholder="https://example.com/file1.pdf, https://example.com/file2.pdf"
                            // value={materials}
                            onChange={(e) => setMaterials(e.target.value)}
                        />
                    </div>

                    {/* Videos */}
                    <div>
                        <label>Videos (URLs, comma separated)</label>
                        <input
                            type="text"
                            placeholder="https://example.com/video1.mp4, https://example.com/video2.mp4"
                            // value={videos}
                            onChange={(e) => setVideos(e.target.value)}
                        />
                    </div>


                    <div className="flex justify-end gap-2 mt-2">
                        <Button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>Cancel</Button>
                        <Button type="submit" onClick={handleSubmit} className="btn-primary" disabled={loading}>
                            {loading ? "Saving..." : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
