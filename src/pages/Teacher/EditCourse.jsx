import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase.js";
import toast from "react-hot-toast";

export default function EditCourseFull() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  // States
  const [modulesList, setModulesList] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [lessonsByModule, setLessonsByModule] = useState({});

  const [moduleData, setModuleData] = useState({
    title: "",
    createdAt: new Date(),
    moduleOrder: 1,
  });

  const [lessonData, setLessonData] = useState({
    title: "",
    createdAt: new Date(),
    lessonOrder: 1,
    liveSessionTitle: "",
    attendanceCount: 0,
    dateTime: new Date(),
    duration: 60,
    link: "",
    status: "upcoming",
    materials: [],
  });

  const [material, setMaterial] = useState({ title: "", file: "" });
  const [selectedModuleId, setSelectedModuleId] = useState("");

  // Edit states
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  // Fetch Course + Modules
  useEffect(() => {
    const fetchData = async () => {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        setCourse(courseSnap.data());
      }

      const modulesCol = collection(db, "courses", courseId, "modules");
      const modulesSnap = await getDocs(modulesCol);
      const list = modulesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setModulesList(list);
    };

    fetchData();
  }, [courseId]);

  // Fetch lessons for a module
  const fetchLessonsForModule = async (moduleId) => {
    const lessonsCol = collection(
      db,
      "courses",
      courseId,
      "modules",
      moduleId,
      "lessons"
    );
    const snap = await getDocs(lessonsCol);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: list,
    }));
  };

  // Toggle Accordion
  const toggleModule = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
      fetchLessonsForModule(moduleId);
    }
  };

  // Add Module
  const handleAddModule = async () => {
    if (!moduleData.title.trim()) {
      toast.error("Module title is required!");
      return;
    }
    if (moduleData.moduleOrder <= 0) {
      toast.error("Module order must be greater than 0!");
      return;
    }

    const modulesCol = collection(db, "courses", courseId, "modules");
    await addDoc(modulesCol, {
      ...moduleData,
      createdAt: Timestamp.fromDate(moduleData.createdAt),
    });

    toast.success("Module added successfully!");

    const modulesSnap = await getDocs(modulesCol);
    setModulesList(modulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    setModuleData({ title: "", createdAt: new Date(), moduleOrder: 1 });
  };

  // Update Module
  const handleUpdateModule = async () => {
    if (!editingModule.title.trim()) {
      toast.error("Module title is required!");
      return;
    }
    if (editingModule.moduleOrder <= 0) {
      toast.error("Module order must be greater than 0!");
      return;
    }

    const moduleRef = doc(db, "courses", courseId, "modules", editingModule.id);
    await updateDoc(moduleRef, {
      title: editingModule.title,
      moduleOrder: editingModule.moduleOrder,
    });

    toast.success("Module updated!");
    setEditingModule(null);

    const modulesCol = collection(db, "courses", courseId, "modules");
    const modulesSnap = await getDocs(modulesCol);
    setModulesList(modulesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // Material field update
  const handleMaterialChange = (field, value) => {
    setMaterial({ ...material, [field]: value });

    setLessonData((prev) => ({
      ...prev,
      materials: [{ ...material, [field]: value }],
    }));
  };

  // Add Lesson
  const handleAddLesson = async () => {
    if (!lessonData.title.trim()) {
      toast.error("Lesson title is required!");
      return;
    }
    if (!selectedModuleId) {
      toast.error("Please select a module!");
      return;
    }
    if (lessonData.lessonOrder <= 0) {
      toast.error("Lesson order must be greater than 0!");
      return;
    }
    if (!lessonData.link.trim()) {
      toast.error("Lesson link is required!");
      return;
    }
    if (lessonData.dateTime < new Date()) {
      toast.error("Lesson date and time must be in the future!");
      return;
    }
    if (lessonData.materials.some((m) => !m.title.trim() || !m.file.trim())) {
      toast.error("All materials must have a title and file URL!");
      return;
    }

    const lessonsCol = collection(
      db,
      "courses",
      courseId,
      "modules",
      selectedModuleId,
      "lessons"
    );

    const liveSessionData = {
      attendanceCount: lessonData.attendanceCount,
      dateTime: Timestamp.fromDate(lessonData.dateTime),
      duration: lessonData.duration,
      link: lessonData.link,
      status: lessonData.status,
      title: lessonData.liveSessionTitle || lessonData.title,
    };

    await addDoc(lessonsCol, {
      createdAt: Timestamp.fromDate(lessonData.createdAt),
      lessonOrder: lessonData.lessonOrder,
      title: lessonData.title,
      liveSession: liveSessionData,
      materials: lessonData.materials.map((m) => ({ ...m })),
    });

    toast.success("Lesson added successfully!");
    fetchLessonsForModule(selectedModuleId);

    setLessonData({
      title: "",
      createdAt: new Date(),
      lessonOrder: 1,
      liveSessionTitle: "",
      attendanceCount: 0,
      dateTime: new Date(),
      duration: 60,
      link: "",
      status: "upcoming",
      materials: [],
    });

    setMaterial({ title: "", file: "" });
  };

  // Update Lesson
  const handleUpdateLesson = async () => {
    const { moduleId, id, title, lessonOrder, liveSession, materials } = editingLesson;

    if (!title.trim()) {
      toast.error("Lesson title is required!");
      return;
    }
    if (lessonOrder <= 0) {
      toast.error("Lesson order must be greater than 0!");
      return;
    }
    if (!liveSession.link.trim()) {
      toast.error("Lesson link is required!");
      return;
    }
    if (liveSession.dateTime.toDate() < new Date()) {
      toast.error("Lesson date and time must be in the future!");
      return;
    }
    if (materials.some((m) => !m.title.trim() || !m.file.trim())) {
      toast.error("All materials must have a title and file URL!");
      return;
    }

    const lessonRef = doc(db, "courses", courseId, "modules", moduleId, "lessons", id);
    await updateDoc(lessonRef, {
      title,
      lessonOrder,
      liveSession,
      materials,
    });

    toast.success("Lesson updated!");
    setEditingLesson(null);
    fetchLessonsForModule(editingLesson.moduleId);
  };

  // Delete Module
  const deleteModule = async (moduleId) => {
    await deleteDoc(doc(db, "courses", courseId, "modules", moduleId));
    toast.success("Module deleted!");

    setModulesList(modulesList.filter((m) => m.id !== moduleId));
  };

  // Delete Lesson
  const deleteLesson = async (moduleId, lessonId) => {
    await deleteDoc(
      doc(db, "courses", courseId, "modules", moduleId, "lessons", lessonId)
    );
    toast.success("Lesson deleted!");
    fetchLessonsForModule(moduleId);
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-[var(--background)] text-[var(--foreground)] min-h-screen space-y-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition flex items-center gap-2"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold text-[var(--primary)]">{course.title}</h2>

      {/* Modules Display */}
      <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold mb-2">All Modules</h3>

        {modulesList.length === 0 && (
          <p className="text-gray-400">No modules added yet.</p>
        )}

        {modulesList.map((mod) => (
          <div key={mod.id} className="border rounded-lg overflow-hidden">

            {/* Module Header */}
            <div
              className="flex justify-between items-center p-4 bg-[var(--muted)] cursor-pointer"
              onClick={() => toggleModule(mod.id)}
            >
              <span className="font-semibold text-lg">{mod.title}</span>
              <span>{expandedModule === mod.id ? "▲" : "▼"}</span>
            </div>

            {/* Module Actions */}
            <div className="flex gap-2 px-4 py-2 bg-gray-50">
              <button
                className="text-blue-600"
                onClick={() => setEditingModule(mod)}
              >
                Edit
              </button>
              <button
                className="text-red-600"
                onClick={() => deleteModule(mod.id)}
              >
                Delete
              </button>
            </div>

            {/* Lessons Inside */}
            {expandedModule === mod.id && (
              <div className="p-4 bg-white border-t space-y-3">
                {lessonsByModule[mod.id]?.map((lesson) => (
                  <div key={lesson.id} className="p-3 border rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{lesson.title}</span>

                      <div className="flex gap-2">
                        <button
                          className="text-blue-600"
                          onClick={() =>
                            setEditingLesson({ ...lesson, moduleId: mod.id })
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-600"
                          onClick={() => deleteLesson(mod.id, lesson.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!lessonsByModule[mod.id] ||
                  lessonsByModule[mod.id].length === 0) && (
                  <p className="text-gray-500">No lessons in this module.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Module */}
      <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold">Add New Module</h3>

        <div className="flex gap-4 flex-col md:flex-row">
          <input
            type="text"
            className="border p-2 rounded flex-1"
            placeholder="Module Title"
            value={moduleData.title}
            onChange={(e) =>
              setModuleData({ ...moduleData, title: e.target.value })
            }
          />

          <input
            type="number"
            className="border p-2 rounded w-32"
            placeholder="Order"
            value={moduleData.moduleOrder}
            onChange={(e) =>
              setModuleData({
                ...moduleData,
                moduleOrder: Number(e.target.value),
              })
            }
          />

          <button
            onClick={handleAddModule}
            className="bg-[var(--primary)] text-white px-4 py-2 rounded hover:opacity-90 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Add Lesson */}
      <div className="bg-[var(--card)] p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold">Add New Lesson</h3>

        <select
          className="border p-2 rounded w-full"
          value={selectedModuleId}
          onChange={(e) => setSelectedModuleId(e.target.value)}
        >
          <option value="">Select Module</option>
          {modulesList.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Lesson Title"
            value={lessonData.title}
            onChange={(e) =>
              setLessonData({ ...lessonData, title: e.target.value })
            }
          />

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Order"
            value={lessonData.lessonOrder}
            onChange={(e) =>
              setLessonData({
                ...lessonData,
                lessonOrder: Number(e.target.value),
              })
            }
          />

          <input
            type="datetime-local"
            className="border p-2 rounded"
            value={lessonData.dateTime.toISOString().slice(0, 16)}
            onChange={(e) =>
              setLessonData({ ...lessonData, dateTime: new Date(e.target.value) })
            }
          />

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Duration"
            value={lessonData.duration}
            onChange={(e) =>
              setLessonData({
                ...lessonData,
                duration: Number(e.target.value),
              })
            }
          />

          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Zoom Link"
            value={lessonData.link}
            onChange={(e) =>
              setLessonData({ ...lessonData, link: e.target.value })
            }
          />

          <select
            className="border p-2 rounded"
            value={lessonData.status}
            onChange={(e) =>
              setLessonData({ ...lessonData, status: e.target.value })
            }
          >
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Materials */}
        <div>
          <h4 className="font-semibold mb-2">Materials</h4>

          <div className="flex gap-4 flex-col md:flex-row">
            <input
              type="text"
              className="border p-2 rounded flex-1"
              placeholder="Material Title"
              value={material.title}
              onChange={(e) =>
                handleMaterialChange("title", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded flex-1"
              placeholder="File URL"
              value={material.file}
              onChange={(e) =>
                handleMaterialChange("file", e.target.value)
              }
            />
          </div>
        </div>

        <button
          onClick={handleAddLesson}
          className="bg-[var(--primary)] text-white px-6 py-2 rounded hover:opacity-90 transition"
        >
          Add Lesson
        </button>
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Module</h3>
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              value={editingModule.title}
              onChange={(e) =>
                setEditingModule({ ...editingModule, title: e.target.value })
              }
            />
            <input
              type="number"
              className="border p-2 rounded w-full mb-4"
              value={editingModule.moduleOrder}
              onChange={(e) =>
                setEditingModule({ ...editingModule, moduleOrder: Number(e.target.value) })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditingModule(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleUpdateModule}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Lesson</h3>

            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              value={editingLesson.title}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, title: e.target.value })
              }
            />
            <input
              type="number"
              className="border p-2 rounded w-full mb-2"
              value={editingLesson.lessonOrder}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, lessonOrder: Number(e.target.value) })
              }
            />

            <input
              type="datetime-local"
              className="border p-2 rounded w-full mb-4"
              value={editingLesson.liveSession.dateTime.toDate().toISOString().slice(0, 16)}
              onChange={(e) =>
                setEditingLesson({
                  ...editingLesson,
                  liveSession: {
                    ...editingLesson.liveSession,
                    dateTime: Timestamp.fromDate(new Date(e.target.value)),
                  },
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditingLesson(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleUpdateLesson}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}