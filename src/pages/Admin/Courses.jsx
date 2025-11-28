// src/pages/Admin/Courses.jsx
import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import SearchBar from '../../components/SearchBar';
import { Button } from '../../components/Button';
import { Edit, PlusCircle, Trash } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import Toast from '../../components/Toast';
import { AddCourseModal } from '../../components/AddCourseModal';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminCourses() {
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState({ message: "", type: "", show: false });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
  };
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "courses"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCourses(list);
    }, (err) => console.error("load courses err", err));

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teachers"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // console.log("Loaded teachers:", list);
      setTeachers(list);
    }, (err) => console.error("load teachers err", err));

    return () => unsubscribe();
  }, []);


  const handleDelete = async (id) => {
    if (!id) {
      console.error("No course ID provided for deletion");
      showToast("Cannot delete course: ID is missing", "error");
      return;
    }

    try {
      console.log("Trying to delete course with id:", id);
      await deleteDoc(doc(db, "courses", id));
      showToast("Course deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete course:", err);
      showToast("Failed to delete course. Try again.", "error");
    }
  };

  const onButtonClick = async (action, courseId) => {
    if (action === "add_course") {
      setSelectedCourse(null);
      setCourseModalOpen(true);
    } else if (action === "edit_course") {
      const course = courses.find(c => c.id === courseId);
      setCourseModalOpen(true);
      setSelectedCourse({
        ...course,
        title: course.title || "",
        title_ar: course.title_ar || "",
        teacherId: course.teacherId || "",
        price: course.price || 0,
        studentsCount: course.studentsCount || 0,
      });
    } else if (action === "delete_course") {
      console.log("Preparing to delete course with id:", courseId);
      setCourseToDelete(courseId);
      setConfirmOpen(true);
    }
  };

  const filteredCourses = courses.filter(
    c =>
      c.title.toLowerCase().includes(query.toLowerCase())
    // c.titleAr.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className="flex items-center justify-between mb-4">
        <Title className="text-lg" enTitle="Course Management" arTitle="إدارة الدورات" />
        <Button
          key="add_course"
          className="btn-primary"
          icon={PlusCircle}
          title="Add New Course"
          onClick={() => onButtonClick('add_course')}
        />
      </div>
      <SearchBar
        placeholder="Search courses by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <AddCourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        // courses={courses}
        teachers={teachers}
        terms={[]}
        course={selectedCourse}       // مهم — يبعت الكورس اللي هيتعدل
        onSave={async (payload) => {
          // لو payload.id موجود -> عمل تحديث، وإلا اضف جديد
          try {
            if (payload.id) {
              await updateDoc(doc(db, "courses", payload.id), {
                title: payload.title,
                title_ar: payload.title_ar ?? payload.title_ar ?? "",
                description: payload.description ?? "",
                price: Number(payload.price) || 0,
                teacherId: payload.teacherId,
                status: payload.status || "Published",
                thumbnail: payload.thumbnail || ""
              });
            } else {
              await addDoc(collection(db, "courses"), {
                title: payload.title,
                title_ar: payload.title_ar ?? payload.title_ar ?? "",
                description: payload.description,
                price: Number(payload.price) || 0,
                teacherId: payload.teacherId,
                status: payload.status || "Published",
                thumbnail: payload.thumbnail || "",
                createdAt: new Date()
              });
            }

            setCourseModalOpen(false);
            setSelectedCourse(null);
            showToast("Course saved successfully", "success");
          } catch (err) {
            console.error("save course err:", err);
            showToast("Failed to save course", "error");
          }
        }}
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => handleDelete(courseToDelete)}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
      />
      <table className="min-w-full divide-y divide-gray-200 mt-6 border border-rounded-xlg overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCourses.map((course) => (
            <tr key={course.id}>
              <td className="p-2 whitespace-nowrap">{course.title}</td>
              <td className="p-2 whitespace-nowrap">{course.title_ar}</td>
              <td className="p-2 whitespace-nowrap">{teachers.find(t => t.id === course.teacherId)?.name || "Unknown"}</td>
              <td className="p-2 whitespace-nowrap">{course.studentsCount || 0}</td>
              <td className="p-2 whitespace-nowrap">{course.price}</td>
              <td className="p-2 whitespace-nowrap">
                <span
                  className={`rounded-2xl px-3 py-1 text-xs 
                    ${course.status === "Published"
                      ? "bg-[#E2ECE7] text-[#0E7C7B]"
                      : "bg-[#F5F3ED] text-gray-500"
                    }`}
                >
                  {course.status}
                </span>
              </td>
              <td className="p-2 whitespace-nowrap flex gap-2">
                <Button
                  key="edit_course"
                  className="btn-secondary"
                  icon={Edit}
                  onClick={() => onButtonClick('edit_course', course.id)}
                />
                <Button
                  key="delete_course"
                  className="btn-secondary text-red-500"
                  icon={Trash}
                  onClick={() => onButtonClick('delete_course', course.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}