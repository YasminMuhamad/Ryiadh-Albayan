import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/TeacherSidebar.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "../components/TeacherUI.jsx";
import { Users, BookOpen, Video } from "lucide-react";
import "../styles/globals.css";
import { kpiDetailsMock } from "../lib/mockData.jsx";

export default function KPIDetailsPage() {
  const navigate = useNavigate();
  const { type } = useParams(); 
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const data = kpiDetailsMock[type]?.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(search.toLowerCase()))) || [];
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((page -1)*itemsPerPage, page*itemsPerPage);

  const titleMap = { students: "Students", courses: "Courses", live: "Live Sessions" };
  const iconMap = { students: <Users className="h-5 w-5 text-[var(--primary)]"/>, courses: <BookOpen className="h-5 w-5 text-[var(--primary)]"/>, live: <Video className="h-5 w-5 text-[var(--primary)]"/> };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar userRole="teacher"/>
      <div className="flex-1 p-6 space-y-6">
        <Card className="card-shadow islamic-pattern-subtle">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">{iconMap[type]}<CardTitle>{titleMap[type]}</CardTitle></div>
            <button onClick={() => navigate(-1)} className="text-[var(--primary)] font-medium hover:underline">← Back</button>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => {setSearch(e.target.value); setPage(1)}}
              className="mb-4 p-2 border border-[var(--border)] rounded w-full"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-[var(--border)] text-left">
                <thead className="bg-[var(--accent)]">
                  <tr>
                    {type === "students" && ["Name","Email","Status"].map(h => <th key={h} className="px-4 py-2 border-b border-[var(--border)]">{h}</th>)}
                    {type === "courses" && ["Course Title","Students Enrolled"].map(h => <th key={h} className="px-4 py-2 border-b border-[var(--border)]">{h}</th>)}
                    {type === "live" && ["Session Title","Time","Duration"].map(h => <th key={h} className="px-4 py-2 border-b border-[var(--border)]">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => (
                    <tr key={item.id} className="hover:bg-[var(--accent)] transition-colors">
                      {type === "students" && <><td className="px-4 py-2">{item.name}</td><td className="px-4 py-2">{item.email}</td><td className="px-4 py-2">{item.status}</td></>}
                      {type === "courses" && <><td className="px-4 py-2">{item.title}</td><td className="px-4 py-2">{item.students}</td></>}
                      {type === "live" && <><td className="px-4 py-2">{item.title}</td><td className="px-4 py-2">{item.time}</td><td className="px-4 py-2">{item.duration}</td></>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length === 0 && <p className="mt-4 text-[var(--muted-foreground)]">No data found</p>}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                {Array.from({length: totalPages}, (_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1 border rounded ${page===i+1 ? "bg-[var(--primary)] text-white" : ""}`}>{i+1}</button>)}
                <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
