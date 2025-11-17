import React, { useState, useEffect } from "react";
import TeacherLayout from "../../components/TeacherLayout";
import Modal from "../../components/Modal";
import { mockSessions, mockCourses } from "../../data/teacherMock";

function formatAbs(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" });
}

function relative(iso) {
  const diff = new Date(iso) - new Date();
  if (diff > 0) {
    const mins = Math.round(diff/60000);
    if (mins < 60) return `Starts in ${mins}m`;
    const hrs = Math.round(mins/60);
    return `Starts in ${hrs}h`;
  } else {
    const mins = Math.round(-diff/60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins/60)}h ago`;
  }
}

export default function LiveSessions(){
  const [sessions, setSessions] = useState(mockSessions);
  const [openSched, setOpenSched] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: mockCourses[0]?.id || "", startAt: "" });

  useEffect(()=> {
    // update statuses by time
    const t = setInterval(()=> {
      setSessions(prev => prev.map(s => {
        const start = new Date(s.startAt);
        const end = new Date(start.getTime() + s.durationMin*60000);
        const now = new Date();
        if(now >= start && now <= end) return {...s, status: "live"};
        if(now < start) return {...s, status: "upcoming"};
        return {...s, status: "finished"};
      }));
    }, 1000*30);
    return ()=> clearInterval(t);
  }, []);

  function schedule(e){
    e.preventDefault();
    if(!form.title || !form.startAt) return alert("Please fill fields");
    const newS = { id: "s-"+Date.now(), title: form.title, courseId: form.courseId, startAt: new Date(form.startAt).toISOString(), durationMin: 60, status: "upcoming" };
    setSessions([newS, ...sessions]);
    setOpenSched(false);
    setForm({ title: "", courseId: mockCourses[0]?.id || "", startAt: "" });
    alert("Scheduled");
  }

  function canJoin(s){
    const start = new Date(s.startAt);
    const now = new Date();
    const diff = start - now; // ms
    return s.status === "live" || (diff <= 1000*60*5 && diff >= -1000*60*60); // within 5 minutes before or live
  }

  return (
    <TeacherLayout>
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Live Sessions</h2>
          <div className="flex gap-2">
            <button onClick={()=>setOpenSched(true)} className="bg-[var(--primary)] text-white px-4 py-2 rounded">Schedule Live Session</button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between bg-[var(--card)] p-4 rounded-lg">
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-gray-600">{formatAbs(s.startAt)} • {s.durationMin} min</div>
                <div className="text-xs text-gray-500">{relative(s.startAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-sm ${s.status==="live" ? "bg-green-100 text-green-700" : s.status==="upcoming" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"}`}>
                  {s.status}
                </div>
                <button disabled={!canJoin(s)} onClick={()=>alert("Joining session...")} className={`px-3 py-1 rounded ${canJoin(s) ? "bg-[var(--primary)] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {s.status==="live" ? "Join Session" : canJoin(s) ? "Join (Starting soon)" : "Join"}
                </button>
                <button onClick={()=>alert("Attendance modal")} className="px-3 py-1 rounded border">Mark Attendance</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={openSched} onClose={()=>setOpenSched(false)} title="Schedule Live Session">
        <form className="space-y-4" onSubmit={schedule}>
          <div>
            <label className="text-sm">Title</label>
            <input className="w-full border p-2 rounded mt-1" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Course</label>
            <select className="w-full border p-2 rounded mt-1" value={form.courseId} onChange={(e)=>setForm({...form, courseId: e.target.value})}>
              {mockCourses.map(c=> <option key={c.id} value={c.id}>{c.title_en}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm">Start (Egypt time)</label>
            <input type="datetime-local" className="w-full border p-2 rounded mt-1" value={form.startAt} onChange={(e)=>setForm({...form, startAt: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>setOpenSched(false)} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white">Schedule</button>
          </div>
        </form>
      </Modal>
    </TeacherLayout>
  );
}
