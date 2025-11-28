// src/pages/Admin/Teachers.jsx
import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import SearchBar from '../../components/SearchBar';
import { Button } from '../../components/Button';
import { Edit, PlusCircle, Trash } from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { AddTeacherModal } from '../../components/AddTeacherModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
export default function AdminTeachers() {
  const [isTeacherModalOpen, setTeacherModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "", show: false });

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
  };
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teachers"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeachers(list);
    }, (err) => console.error("load teachers err", err));

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!id) {
      console.error("No teacher ID provided for deletion");
      showToast("Cannot delete teacher: ID is missing", "error");
      return;
    }

    try {
      console.log("Trying to delete teacher with id:", id);
      await deleteDoc(doc(db, "teachers", id));
      showToast("Teacher deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      showToast("Failed to delete teacher. Try again.", "error");
    }
  };

  const onButtonClick = async (action, teacherId) => {
    if (action === "add_teacher") {
      setSelectedTeacher(null);
      setTeacherModalOpen(true);
    } else if (action === "edit_teacher") {
      const teacher = teachers.find(t => t.id === teacherId);
      setTeacherModalOpen(true);
      setSelectedTeacher({
        ...teacher,
        fullName: teacher.name || "",
        arabicName: teacher.name_ar || "",
        email: teacher.email || "",
        specialization: teacher.specialization || "",
      });
    } else if (action === "delete_teacher") {
      console.log("Preparing to delete teacher with id:", teacherId);
      setTeacherToDelete(teacherId);
      setConfirmOpen(true);
    }
  };

  const filteredTeachers = teachers.filter(
    t =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.name_ar.toLowerCase().includes(query.toLowerCase()) ||
      t.email.toLowerCase().includes(query.toLowerCase())
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
        <Title className="text-lg" enTitle="Teachers Management" arTitle="إدارة المعلمين" />
        <Button
          key="add_teacher"
          className="btn-primary"
          icon={PlusCircle}
          title="Add New Teacher"
          onClick={() => onButtonClick('add_teacher')}
        />
      </div>

      <div>
        <SearchBar
          placeholder="Search teachers by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <AddTeacherModal
          isOpen={isTeacherModalOpen}
          onClose={() => setTeacherModalOpen(false)}
          teacher={selectedTeacher}
          onSave={async (data) => {
            try {
              if (data.id) {
                await updateDoc(doc(db, "teachers", data.id), data);
                showToast("Teacher updated successfully", "success");
              } else {
                await addDoc(collection(db, "teachers"), { ...data, status: "Active" });
                showToast("Teacher added successfully", "success");
              }
            } catch (err) {
              showToast("Failed to add/update teacher. Try again.", "error");
              return;
            }
            setTeacherModalOpen(false);
          }}

        />

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => handleDelete(teacherToDelete)}
          title="Delete Teacher"
          message="Are you sure you want to delete this teacher? This action cannot be undone."
        />


        <table className="min-w-full divide-y divide-gray-200 mt-6 border border-rounded-xlg overflow-hidden text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id}>
                <td className="p-2 whitespace-nowrap">{teacher.name}</td>
                <td className="p-2 whitespace-nowrap">{teacher.name_ar}</td>
                <td className="p-2 whitespace-nowrap">{teacher.email}</td>
                <td className="p-2 whitespace-nowrap">{teacher.coursesCount || 0}</td>
                <td className="p-2 whitespace-nowrap">{teacher.studentsCount || 0}</td>
                <td className="p-2 whitespace-nowrap">
                  <span
                    className={`rounded-2xl px-3 py-1 text-xs ${teacher.status
                      ? "bg-[#E2ECE7] text-[#0E7C7B]"
                      : "bg-[#F5F3ED] text-gray-500"
                      }`}
                  >
                    {teacher.status || "Inactive"}
                  </span>
                </td>
                <td className="p-2 whitespace-nowrap flex gap-2">
                  <Button
                    key="edit_teacher"
                    className="btn-secondary"
                    icon={Edit}
                    onClick={() => onButtonClick('edit_teacher', teacher.id)}
                  />
                  <Button
                    key="delete_teacher"
                    className="btn-secondary text-red-500"
                    icon={Trash}
                    onClick={() => onButtonClick('delete_teacher', teacher.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>


      </div>
    </div>
  );
}