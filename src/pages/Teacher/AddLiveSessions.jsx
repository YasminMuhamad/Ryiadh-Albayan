// src/pages/AddLiveSession.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, query, where, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Toast from "../../components/Toast.jsx";
import toast from "react-hot-toast";

const AddLiveSession = () => {
  const navigate = useNavigate();
  const { uid: teacherId } = useAuth();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");

  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");

  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("scheduled");

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [teacherId]);

  // Fetch modules when course changes
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchModules = async () => {
      try {
        const q = collection(db, `courses/${selectedCourse}/modules`);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setModules(data);
        if (data.length > 0) setSelectedModule(data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchModules();
  }, [selectedCourse]);

  // Fetch lessons when module changes
  useEffect(() => {
    if (!selectedCourse || !selectedModule) return;

    const fetchLessons = async () => {
      try {
        const q = collection(db, `courses/${selectedCourse}/modules/${selectedModule}/lessons`);
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLessons(data);
        if (data.length > 0) setSelectedLesson(data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLessons();
  }, [selectedCourse, selectedModule]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedModule || !selectedLesson) {
      toast("Please select course, module, and lesson!");
      return;
    }

    try {
      const lessonRef = doc(db, `courses/${selectedCourse}/modules/${selectedModule}/lessons/${selectedLesson}`);

      const liveSessionObj = {
        title,
        dateTime: Timestamp.fromDate(new Date(dateTime)),
        duration: Number(duration),
        link,
        status,
        attendanceCount: 0,
        attendance: [],
      };

      await updateDoc(lessonRef, {
        liveSession: liveSessionObj,
      });

      toast("Live session added successfully!");
      navigate(`/teacher/dashboard`);
    } catch (err) {
      console.error(err);
      toast("Failed to add live session.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="heading-1 mb-4">Add Live Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Select Course */}
        <div>
          <label className="font-medium">Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">-- Select Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        {/* Select Module */}
        <div>
          <label className="font-medium">Select Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">-- Select Module --</option>
            {modules.map(mod => (
              <option key={mod.id} value={mod.id}>{mod.title}</option>
            ))}
          </select>
        </div>

        {/* Select Lesson */}
        <div>
          <label className="font-medium">Select Lesson:</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">-- Select Lesson --</option>
            {lessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </div>

        {/* Live session details */}
        <div>
          <label className="font-medium">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border rounded px-3 py-2 w-full"
            placeholder="Live session title"
          />
        </div>

        <div>
          <label className="font-medium">Date & Time:</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="font-medium">Duration (minutes):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="font-medium">Zoom / Session Link:</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="border rounded px-3 py-2 w-full"
            placeholder="https://zoom.us/..."
          />
        </div>

        <div>
          <label className="font-medium">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button type="submit" className="btn-primary mt-4">
          Add Live Session
        </button>
      </form>
    </div>
  );
};

export default AddLiveSession;
