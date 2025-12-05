// src/pages/Admin/CourseContent.jsx
import React, { useEffect, useState, useCallback } from "react";
import { db } from '../../../firebase.config';
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    getDocs,
    updateDoc
} from "firebase/firestore";
import { Plus, Trash } from 'lucide-react';
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export function CourseContent({ courseId, setActiveTab }) {
    // original remote data
    const [course, setCourse] = useState(null);
    const [loadingRemote, setLoadingRemote] = useState(false);

    // metadata controls (local editable before Save)
    const [categories, setCategories] = useState([]); // { id, title }
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Published");
    const [selectedType, setSelectedType] = useState("recorded");

    // local editable copies
    const [modulesLocal, setModulesLocal] = useState([]); // each item: { id?, title, _state: 'unchanged'|'new'|'modified'|'deleted' }
    const [lessonsMapLocal, setLessonsMapLocal] = useState({}); // { moduleTempIdOrId: [ { id?, title, content, _state } ] }

    // UI state
    const [addingModuleTitle, setAddingModuleTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(false);
    const [newCategoryTitle, setNewCategoryTitle] = useState("");
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        confirmText: "Delete",
        onConfirm: null
    });
    // statuses & types options
    const STATUS_OPTIONS = ["Published", "Draft", "Inactive"];
    const TYPE_OPTIONS = ["recorded", "live", "blended"];

    // --- fetch categories once ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snap = await getDocs(collection(db, "categories"));
                const cats = snap.docs.map(d => ({ id: d.id, title: d.data().title || d.data().name || d.id }));
                setCategories(cats);
            } catch (err) {
                console.error("fetch categories err", err);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // --- load course doc (optional display) ---
    useEffect(() => {
        if (!courseId) {
            setCourse(null);
            return;
        }
        const unsub = onSnapshot(doc(db, "courses", courseId), (snap) => {
            if (snap.exists()) setCourse({ id: snap.id, ...snap.data() });
            else setCourse(null);
        }, (err) => console.error("course snap err", err));
        return () => unsub();
    }, [courseId]);

    // when course doc changes, populate the local metadata fields (category/status/type)
    useEffect(() => {
        if (!course) return;
        setSelectedCategory(course.category ?? "");
        setSelectedStatus(course.status ?? "Published");
        setSelectedType(course.type ?? "recorded");
    }, [course]);

    // --- fetch modules & lessons once initially and populate local editable copies ---
    const fetchRemoteAndPopulateLocal = useCallback(async () => {
        if (!courseId) {
            setModulesLocal([]);
            setLessonsMapLocal({});
            return;
        }
        setLoadingInitial(true);
        try {
            // fetch modules
            const modulesCol = collection(db, "courses", courseId, "modules");
            const q = query(modulesCol, orderBy("createdAt", "asc"));
            const modulesSnap = await getDocs(q);
            const modules = modulesSnap.docs.map(d => ({ id: d.id, title: d.data().title || "" }));
            // fetch lessons per module
            const lessonsMap = {};
            await Promise.all(modules.map(async (m) => {
                const lessonsCol = collection(db, "courses", courseId, "modules", m.id, "lessons");
                const lessonsSnap = await getDocs(lessonsCol);
                lessonsMap[m.id] = lessonsSnap.docs.map(d => ({
                    id: d.id,
                    title: d.data().title || "",
                    content: d.data().content || "",
                    materials: d.data().materials || [],
                    video: d.data().video || null
                }));
            }));

            // set local copies with _state = 'unchanged'
            setModulesLocal(modules.map(m => ({ ...m, _state: 'unchanged' })));
            const lessonsLocalMap = {};
            Object.keys(lessonsMap).forEach(mid => {
                lessonsLocalMap[mid] = lessonsMap[mid].map(ls => ({ ...ls, _state: 'unchanged' }));
            });
            setLessonsMapLocal(lessonsLocalMap);
        } catch (err) {
            console.error("fetch remote err", err);
            setModulesLocal([]);
            setLessonsMapLocal({});
        } finally {
            setLoadingInitial(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchRemoteAndPopulateLocal();
    }, [courseId, fetchRemoteAndPopulateLocal]);

    // ---------- Local operations (do NOT touch DB) ----------

    // add module locally (use temp id prefixed with temp_)
    const addModuleLocal = () => {
        const title = addingModuleTitle?.trim();
        if (!title) return;
        const tempId = `temp_${Date.now()}`;
        setModulesLocal(prev => [...prev, { id: tempId, title, _state: 'new' }]);
        setLessonsMapLocal(prev => ({ ...prev, [tempId]: [] }));
        setAddingModuleTitle("");
    };

    // edit module title locally
    const editModuleTitleLocal = (moduleId, newTitle) => {
        setModulesLocal(prev => prev.map(m => m.id === moduleId ? { ...m, title: newTitle, _state: m._state === 'new' ? 'new' : 'modified' } : m));
    };

    // mark module deleted locally (toggle)
    const toggleDeleteModuleLocal = (moduleId) => {
        setModulesLocal(prev => prev.map(m => {
            if (m.id !== moduleId) return m;
            // if it's new -> remove entirely
            if (m._state === 'new') return null;
            // otherwise mark deleted or undo delete
            return { ...m, _state: (m._state === 'deleted' ? 'unchanged' : 'deleted') };
        }).filter(Boolean));
        // Keep lessonsMapLocal as-is; on Save we'll handle deletions cascade
    };

    // add lesson locally (under moduleId which may be temp)
    const addLessonLocal = (moduleId, title, content = "") => {
        if (!title || !title.trim()) return;
        const tempLId = `temp_l_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setLessonsMapLocal(prev => {
            const list = prev[moduleId] ? [...prev[moduleId]] : [];
            list.push({ id: tempLId, title: title.trim(), content: content ?? "", materials: [], video: null, _state: 'new' });
            return { ...prev, [moduleId]: list };
        });
    };

    // edit lesson locally
    const editLessonLocal = (moduleId, lessonId, field, value) => {
        setLessonsMapLocal(prev => {
            const list = (prev[moduleId] || []).map(ls => {
                if (ls.id !== lessonId) return ls;
                return { ...ls, [field]: value, _state: ls._state === 'new' ? 'new' : 'modified' };
            });
            return { ...prev, [moduleId]: list };
        });
    };
    const editLessonMaterialLocal = (moduleId, lessonId, materialIdx, field, value) => {
        setLessonsMapLocal(prev => {
            const list = (prev[moduleId] || []).map(ls => {
                if (ls.id !== lessonId) return ls;
                const materials = ls.materials ? [...ls.materials] : [];
                materials[materialIdx] = { ...materials[materialIdx], [field]: value };
                return { ...ls, materials, _state: ls._state === 'new' ? 'new' : 'modified' };
            });
            return { ...prev, [moduleId]: list };
        });
    };

    // mark lesson deleted locally (if new remove, else mark deleted)
    const toggleDeleteLessonLocal = (moduleId, lessonId) => {
        setLessonsMapLocal(prev => {
            const list = (prev[moduleId] || []).map(ls => {
                if (ls.id !== lessonId) return ls;
                if (ls._state === 'new') return null;
                return { ...ls, _state: ls._state === 'deleted' ? 'unchanged' : 'deleted' };
            }).filter(Boolean);
            return { ...prev, [moduleId]: list };
        });
    };

    // Cancel: reload from remote (also reset metadata to remote values)
    const handleCancel = () => {
        // reload remote modules/lessons and course metadata
        fetchRemoteAndPopulateLocal();
        if (course) {
            setSelectedCategory(course.category ?? "");
            setSelectedStatus(course.status ?? "Published");
            setSelectedType(course.type ?? "recorded");
        }
    };

    // helper to compute totals by querying the DB (accurate)
    const computeTotalsFromServer = async () => {
        if (!courseId) return { totalModules: 0, totalLessons: 0 };
        try {
            const modulesSnap = await getDocs(collection(db, "courses", courseId, "modules"));
            const modulesList = modulesSnap.docs.map(d => d.id);
            let lessonsCount = 0;
            await Promise.all(modulesList.map(async (mid) => {
                const lessonsSnap = await getDocs(collection(db, "courses", courseId, "modules", mid, "lessons"));
                lessonsCount += lessonsSnap.size;
            }));
            return { totalModules: modulesList.length, totalLessons: lessonsCount };
        } catch (err) {
            console.error("computeTotalsFromServer err", err);
            return { totalModules: 0, totalLessons: 0 };
        }
    };

    // ---------- Save: commit local changes to Firestore ----------
    const handleSave = async () => {
        if (!courseId) return;
        setSaving(true);

        try {
            // 1) Create/update modules & keep tempId -> realId mapping
            const tempMap = {}; // temp module id => new module id

            for (const [index, m] of modulesLocal.entries()) {
                let finalModuleId = m.id;

                if (m._state === 'new') {
                    const newDocRef = await addDoc(collection(db, "courses", courseId, "modules"), {
                        title: m.title,
                        createdAt: serverTimestamp(),
                        moduleOrder: index + 1
                    });
                    finalModuleId = newDocRef.id;
                    tempMap[m.id] = finalModuleId;
                } else if (m._state === 'modified') {
                    await updateDoc(doc(db, "courses", courseId, "modules", m.id), {
                        title: m.title,
                        updatedAt: serverTimestamp(),
                        moduleOrder: index + 1
                    });
                }

                // 2) Process lessons inside this module
                const lessonsList = lessonsMapLocal[m.id] || [];
                for (const [lIndex, ls] of lessonsList.entries()) {
                    const lessonData = {
                        title: ls.title,
                        content: ls.content ?? "",
                        materials: ls.materials ?? [],
                        video: ls.video ?? null,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        lessonOrder: lIndex + 1
                    };

                    if (ls._state === 'new') {
                        await addDoc(
                            collection(db, "courses", courseId, "modules", finalModuleId, "lessons"),
                            lessonData
                        );
                    } else if (ls._state === 'modified') {
                        await updateDoc(
                            doc(db, "courses", courseId, "modules", finalModuleId, "lessons", ls.id),
                            lessonData
                        );
                    } else if (ls._state === 'deleted') {
                        if (!ls.id?.toString?.().startsWith?.('temp_')) {
                            await deleteDoc(
                                doc(db, "courses", courseId, "modules", finalModuleId, "lessons", ls.id)
                            );
                        }
                    }
                }
            }

            // 3) Delete modules marked deleted
            const deletedModules = modulesLocal.filter(m => m._state === 'deleted').map(m => m.id);
            for (const mid of deletedModules) {
                if (mid?.toString?.().startsWith?.('temp_')) continue;

                const lessonsCol = collection(db, "courses", courseId, "modules", mid, "lessons");
                const lessonsSnap = await getDocs(lessonsCol);
                await Promise.all(lessonsSnap.docs.map(d => deleteDoc(doc(db, "courses", courseId, "modules", mid, "lessons", d.id))));

                await deleteDoc(doc(db, "courses", courseId, "modules", mid));
            }

            // 4) Update course metadata & totals
            const totals = await computeTotalsFromServer();
            await updateDoc(doc(db, "courses", courseId), {
                category: selectedCategory ?? null,
                status: selectedStatus ?? "Published",
                type: selectedType ?? "recorded",
                totalModules: totals.totalModules,
                totalLessons: totals.totalLessons,
                updatedAt: serverTimestamp()
            });

            // 5) Refresh local state from DB
            await fetchRemoteAndPopulateLocal();

        } catch (err) {
            console.error("save changes err", err);
            alert("Failed to save changes. Check console.");
        } finally {
            setSaving(false);
        }
    };

    // Helpers to render UI state
    const moduleVisible = (m) => m._state !== 'deleted';

    // --- Helper to open confirm modal ---
    const openConfirm = (type, payload, title, message) => {
        let onConfirm;
        let confirmText = "Confirm";

        if (type === "add") {
            confirmText = "Add";
            onConfirm = async () => {
                try {
                    const docRef = await addDoc(collection(db, "categories"), { title: payload });
                    setCategories(prev => [...prev, { id: docRef.id, title: payload }]);
                    setNewCategoryTitle("");
                    toast.success("Category added successfully!");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to add category");
                }
            };
        } else if (type === "update") {
            confirmText = "Save";
            onConfirm = async () => {
                try {
                    await updateDoc(doc(db, "categories", payload.id), { title: payload.title });
                    setCategories(prev => prev.map(c => c.id === payload.id ? { ...c, title: payload.title } : c));
                    toast.success("Category updated!");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to update category");
                }
            };
        } else if (type === "delete") {
            confirmText = "Delete";
            onConfirm = async () => {
                try {
                    await deleteDoc(doc(db, "categories", payload.id));
                    setCategories(prev => prev.filter(c => c.id !== payload.id));
                    if (selectedCategory === payload.id) setSelectedCategory("");
                    toast.success("Category deleted!");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to delete category");
                }
            };
        }

        setConfirmModal({
            isOpen: true,
            title,
            message,
            confirmText,
            onConfirm
        });
    };

    // --- Add new category ---
    const handleAddCategory = () => {
        const title = newCategoryTitle.trim();
        if (!title) return;
        openConfirm("add", title, "Add Category", `Are you sure you want to add category "${title}"?`, "Add", "add");
    };

    // --- Save edit ---
    const saveCategoryEdit = (id, title) => {
        const newTitle = title.trim();
        if (!newTitle) return;
        openConfirm("update", { id, title: newTitle }, "Update Category", `Save changes to category "${newTitle}"?`);
    };
    const handleEditCategory = (id, title) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    };
    // --- Delete category ---
    const handleDeleteCategory = (id) => {
        const cat = categories.find(c => c.id === id);
        if (!cat) return;
        openConfirm("delete", { id }, "Delete Category", `Are you sure you want to delete category "${cat.title}"?`);
    };
    // -------- Drag & Drop Handler ----------
    const onDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return; // drop خارج الـ list
        if (type === "MODULE") {
            const reordered = Array.from(modulesLocal);
            const [moved] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, moved);
            setModulesLocal(reordered);
        } else if (type.startsWith("LESSON_")) {
            const moduleId = type.replace("LESSON_", "");
            const list = Array.from(lessonsMapLocal[moduleId] || []);
            const [moved] = list.splice(source.index, 1);
            list.splice(destination.index, 0, moved);
            setLessonsMapLocal(prev => ({ ...prev, [moduleId]: list }));
        }
    };

    // ---------- Render ----------
    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <button
                        onClick={() => setActiveTab && setActiveTab("courses")}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                        ← Back
                    </button>
                </div>

                <div className="text-center">
                    <h2 className="text-lg font-bold">Course Content</h2>
                    <p className="text-sm text-gray-500">{course ? course.title : `Course ID: ${courseId}`}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={loadingInitial || saving}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loadingInitial || saving}
                        className="px-3 py-1 rounded bg-[#0E7C7B] text-white disabled:opacity-60 inline-flex items-center gap-2"
                    >
                        {saving ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                            </svg>
                        ) : null}
                        Save
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={async () => {
                    if (confirmModal.onConfirm) await confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
            />



            {/* ----- Metadata controls (category / status / type) ----- */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm mb-1">Category</label>
                    <select
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
                        disabled={loadingInitial || saving}
                    >
                        <option value="">-- Select category --</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
                        disabled={loadingInitial || saving}
                    >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Type</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
                        disabled={loadingInitial || saving}
                    >
                        {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-medium mb-2">Add Module (local)</h3>
                <div className="flex gap-2">
                    <input
                        value={addingModuleTitle}
                        onChange={(e) => setAddingModuleTitle(e.target.value)}
                        placeholder="Module title"
                        className="flex-1 p-2 rounded border bg-[#F5F3ED] focus:outline-none"
                        disabled={loadingInitial || saving}
                    />
                    <button
                        onClick={addModuleLocal}
                        disabled={!addingModuleTitle.trim() || loadingInitial || saving}
                        className="px-4 py-2 rounded bg-[#0E7C7B] text-white disabled:opacity-60 inline-flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add (local)
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Modules (local edits)</h3>

                {(loadingInitial) && <p className="text-sm text-gray-500">Loading...</p>}

                {(!loadingInitial && modulesLocal.length === 0) && (
                    <p className="text-sm text-gray-500">No modules yet. Add one above.</p>
                )}

                <div className="space-y-4">
                    {modulesLocal.map((m) => (
                        <div key={m.id} className={`bg-white border rounded p-4 ${m._state === 'deleted' ? 'opacity-50' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <input
                                        value={m.title}
                                        onChange={(e) => editModuleTitleLocal(m.id, e.target.value)}
                                        className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
                                        disabled={saving}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Module ID: {m.id?.toString?.().startsWith?.('temp_') ? '(new local)' : m.id}</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => toggleDeleteModuleLocal(m.id)}
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded ${m._state === 'deleted' ? 'bg-yellow-100' : 'bg-red-50 text-red-600'}`}
                                        disabled={saving}
                                    >
                                        <Trash className="h-4 w-4" />
                                        {m._state === 'deleted' ? 'Undo' : 'Delete'}
                                    </button>
                                </div>
                            </div>

                            {/* Lessons for this module (local) */}
                            <div className="mt-4">
                                <div className="space-y-2">
                                    {/* Existing lessons (not deleted) */}
                                    {(lessonsMapLocal[m.id] || []).filter(ls => ls._state !== 'deleted').map(ls => (
                                        <div key={ls.id} className="p-3 bg-[#F9FAFB] rounded border">
                                            {/* Lesson title & content */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1">
                                                    <input
                                                        value={ls.title}
                                                        onChange={(e) => editLessonLocal(m.id, ls.id, 'title', e.target.value)}
                                                        className="w-full p-1 rounded border bg-white focus:outline-none"
                                                        placeholder="Lesson title"
                                                    />
                                                    <textarea
                                                        value={ls.content}
                                                        onChange={(e) => editLessonLocal(m.id, ls.id, 'content', e.target.value)}
                                                        className="w-full mt-1 p-1 rounded border bg-white focus:outline-none text-sm"
                                                        placeholder="Lesson content (optional)"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => toggleDeleteLessonLocal(m.id, ls.id)}
                                                        className="text-red-500 text-xs flex items-center gap-1"
                                                    >
                                                        <Trash className="h-4 w-4" /> Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Materials */}
                                            <div className="mt-2 space-y-2">
                                                {(ls.materials || []).map((mat, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input
                                                            placeholder="Material title"
                                                            value={mat.title}
                                                            onChange={(e) => editLessonMaterialLocal(m.id, ls.id, idx, 'title', e.target.value)}
                                                            className="p-1 rounded border bg-white focus:outline-none flex-1"
                                                        />
                                                        <input
                                                            placeholder="Material file URL"
                                                            value={mat.file}
                                                            onChange={(e) => editLessonMaterialLocal(m.id, ls.id, idx, 'file', e.target.value)}
                                                            className="p-1 rounded border bg-white focus:outline-none flex-1"
                                                        />
                                                        <select
                                                            value={mat.type || 'file'}
                                                            onChange={(e) => editLessonMaterialLocal(m.id, ls.id, idx, 'type', e.target.value)}
                                                            className="p-1 rounded border bg-white focus:outline-none"
                                                        >
                                                            <option value="pdf">Pdf</option>
                                                            <option value="pptx">Ppt</option>
                                                        </select>
                                                        <button
                                                            onClick={() => editLessonLocal(m.id, ls.id, 'materials', (ls.materials || []).filter((_, i) => i !== idx))}
                                                            className="text-red-500 px-2 py-1 rounded"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Add new material */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input id={`newMatTitle_${ls.id}`} placeholder="Material title" className="p-1 rounded border bg-[#F5F3ED] flex-1" />
                                                    <input id={`newMatFile_${ls.id}`} placeholder="Material file URL" className="p-1 rounded border bg-[#F5F3ED] flex-1" />
                                                    <select id={`newMatType_${ls.id}`} className="p-1 rounded border bg-[#F5F3ED]">
                                                        <option value="pdf">Pdf</option>
                                                        <option value="pptx">Ppt</option>
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            const title = document.getElementById(`newMatTitle_${ls.id}`).value.trim();
                                                            const file = document.getElementById(`newMatFile_${ls.id}`).value.trim();
                                                            const type = document.getElementById(`newMatType_${ls.id}`).value;
                                                            if (!title || !file) return;
                                                            editLessonLocal(m.id, ls.id, 'materials', [...(ls.materials || []), { title, file, type }]);
                                                            document.getElementById(`newMatTitle_${ls.id}`).value = "";
                                                            document.getElementById(`newMatFile_${ls.id}`).value = "";
                                                        }}
                                                        className="px-2 py-1 bg-green-600 text-white rounded"
                                                    >
                                                        Add Material
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Video input */}
                                            <div className="mt-4 p-2 border-t border-gray-200">
                                                <label className="block text-sm mb-1 font-medium">Lesson Video (single)</label>
                                                <input
                                                    placeholder="Video file URL"
                                                    value={ls.video?.file || ""}
                                                    onChange={(e) => editLessonLocal(m.id, ls.id, 'video', { ...(ls.video || {}), file: e.target.value })}
                                                    className="w-full p-1 rounded border bg-white focus:outline-none"
                                                />
                                                <input
                                                    placeholder="Video title"
                                                    value={ls.video?.title || ""}
                                                    onChange={(e) => editLessonLocal(m.id, ls.id, 'video', { ...(ls.video || {}), title: e.target.value })}
                                                    className="w-full mt-1 p-1 rounded border bg-white focus:outline-none"
                                                />
                                                {ls.video && (
                                                    <button
                                                        onClick={() => editLessonLocal(m.id, ls.id, 'video', null)}
                                                        className="mt-2 px-2 py-1 text-red-600 rounded border"
                                                    >
                                                        Remove Video
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Deleted lessons as faded */}
                                    {(lessonsMapLocal[m.id] || []).filter(ls => ls._state === 'deleted').map(ls => (
                                        <div key={ls.id} className="flex items-center justify-between px-2 py-1 bg-yellow-50 rounded opacity-80">
                                            <div>
                                                <div className="text-sm">{ls.title}</div>
                                                <div className="text-xs text-gray-500">deleted (local)</div>
                                            </div>
                                            <div>
                                                <button onClick={() => editLessonLocal(m.id, ls.id, '_state', 'unchanged')} className="px-2 py-1 bg-gray-200 rounded">Undo</button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Always visible: Add new lesson */}
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            id={`newLessonTitle_${m.id}`}
                                            placeholder="New lesson title"
                                            className="flex-1 p-2 rounded border bg-[#F5F3ED] focus:outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                const title = document.getElementById(`newLessonTitle_${m.id}`).value.trim();
                                                if (!title) return;
                                                addLessonLocal(m.id, title);
                                                document.getElementById(`newLessonTitle_${m.id}`).value = "";
                                            }}
                                            className="px-3 py-2 bg-green-600 text-white rounded"
                                        >
                                            Add Lesson
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
                
                {/* ----- Category Management ----- */}
                <div className="my-6 p-4 bg-white rounded-lg shadow-sm border">
                    <h3 className="font-medium mb-2">Manage Categories</h3>

                    {/* Add new category */}
                    <div className="flex gap-2 mb-3">
                        <input
                            placeholder="New category title"
                            value={newCategoryTitle}
                            onChange={(e) => setNewCategoryTitle(e.target.value)}
                            className="flex-1 p-2 rounded border bg-[#F5F3ED] focus:outline-none"
                            disabled={saving || loadingInitial}
                        />
                        <button
                            onClick={handleAddCategory}
                            disabled={!newCategoryTitle.trim() || saving || loadingInitial}
                            className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60"
                        >
                            Add
                        </button>
                    </div>

                    {/* List existing categories */}
                    <div className="space-y-2">
                        {categories.map(c => (
                            <div key={c.id} className="flex items-center gap-2">
                                {/* Editable title */}
                                <input
                                    value={c.title}
                                    onChange={(e) => handleEditCategory(c.id, e.target.value)}
                                    className="flex-1 p-1 rounded border bg-white focus:outline-none"
                                    disabled={saving || loadingInitial}
                                />
                                {/* Save edit */}
                                <button
                                    onClick={() => saveCategoryEdit(c.id, c.title)}
                                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded"
                                    disabled={saving || loadingInitial}
                                >
                                    Save
                                </button>
                                {/* Delete category */}
                                <button
                                    onClick={() => handleDeleteCategory(c.id)}
                                    className="px-2 py-1 bg-red-100 text-red-600 rounded"
                                    disabled={saving || loadingInitial}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
