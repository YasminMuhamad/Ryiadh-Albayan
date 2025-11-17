import React, { useState } from "react";
import TeacherLayout from "../../components/TeacherLayout";
import Modal from "../../components/Modal";
import { mockCourses } from "../../data/teacherMock";

export default function Courses() {
  const [courses, setCourses] = useState(mockCourses);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title_ar: "", title_en: "" });

  function openForEdit(c){
    setEditing(c);
    setForm({ title_ar: c.title_ar, title_en: c.title_en });
    setOpenCreate(true);
  }

  function saveCourse(e){
    e.preventDefault();
    if(editing){
      setCourses(courses.map(c=> c.id === editing.id ? {...c, ...form} : c));
      setEditing(null);
    } else {
      const newC = { id: "c-"+Date.now(), ...form, status: "Draft", students: 0 };
      setCourses([newC, ...courses]);
    }
    setForm({ title_ar: "", title_en: "" });
    setOpenCreate(false);
    alert("Saved");
  }

  function deleteCourse(id){
    if(!confirm("Delete course?")) return;
    setCourses(courses.filter(c=> c.id !== id));
    alert("Deleted");
  }

  const filtered = courses.filter(c => {
    if(filter !== "All" && c.status !== filter) return false;
    if(query && ! (c.title_en.toLowerCase().includes(query.toLowerCase()) || c.title_ar.includes(query))) return false;
    return true;
  });

  return (
    <TeacherLayout>
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <div className="flex gap-2">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search courses..." className="border p-2 rounded" />
            <button className="bg-[var(--primary)] text-white px-4 py-2 rounded" onClick={()=>{ setEditing(null); setOpenCreate(true);}}>Create New</button>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {["All","Published","Draft","Archived"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded ${filter===f ? "bg-[var(--primary)] text-white" : "border"}`}>{f}</button>
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-[var(--card)] p-4 rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-arabic rtl text-lg font-semibold">{c.title_ar}</div>
                  <div className="text-sm text-gray-600">{c.title_en}</div>
                  <div className="text-xs mt-2 text-gray-500">{c.students} students • {c.status}</div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button onClick={()=>openForEdit(c)} className="px-3 py-1 rounded border text-sm">Edit</button>
                  <button onClick={()=>deleteCourse(c.id)} className="px-3 py-1 rounded border text-sm text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-2 text-center text-gray-500 p-6 bg-white rounded">No courses found.</div>}
        </div>
      </div>

      <Modal open={openCreate} onClose={()=>setOpenCreate(false)} title={editing ? "Edit Course" : "Create Course"}>
        <form onSubmit={saveCourse} className="space-y-4">
          <div>
            <label className="text-sm">Course title (Arabic)</label>
            <input className="w-full border p-2 mt-1 rounded rtl font-arabic" dir="rtl" value={form.title_ar} onChange={(e)=>setForm({...form, title_ar: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Course title (English)</label>
            <input className="w-full border p-2 mt-1 rounded" value={form.title_en} onChange={(e)=>setForm({...form, title_en: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setOpenCreate(false)} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white">Save</button>
          </div>
        </form>
      </Modal>
    </TeacherLayout>
  );
}
