import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase.config";
import { TeacherContext } from "../../context/TeacherContext.jsx";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const AddQuizPage = () => {
  const navigate = useNavigate();
  const { teacher } = useContext(TeacherContext);
  const teacherId = teacher?.id;

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  // ===== FETCH COURSES =====
  useEffect(() => {
    if (!teacherId) return;
    const fetchCourses = async () => {
      const snap = await getDocs(collection(db, "courses"));
      const teacherCourses = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((c) => c.teacherId === teacherId);
      setCourses(teacherCourses);
      setSelectedCourse(teacherCourses[0] || null);
    };
    fetchCourses();
  }, [teacherId]);

  // ===== FETCH MODULES WHEN COURSE CHANGES =====
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchModules = async () => {
      const snap = await getDocs(
        collection(db, `courses/${selectedCourse.id}/modules`)
      );
      setModules(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setSelectedModule(snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null);
    };
    fetchModules();
  }, [selectedCourse]);

  // ===== ADD NEW QUESTION =====
  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: 0 }]);
  };

  // ===== REMOVE QUESTION =====
  const removeQuestion = (index) => {
    const temp = [...questions];
    temp.splice(index, 1);
    setQuestions(temp);
  };

  // ===== SAVE QUIZ =====
  const handleAddQuiz = async () => {
    if (!selectedCourse || !selectedModule) return alert("Select course and module first!");
    if (!quizTitle) return alert("Enter quiz title!");
    if (questions.length === 0) return alert("Add at least one question!");

    const quizRef = collection(db, `courses/${selectedCourse.id}/modules/${selectedModule.id}/quizzes`);
    await addDoc(quizRef, {
      title: quizTitle,
      questionsList: questions,
      createdAt: serverTimestamp(),
      teacherId,
      status: "Published",
      submissionsCount: 0,
      totalMarks: questions.length,
    });

    alert("Quiz added successfully!");
    navigate("/teacher/dashboard");
  };

  return (
    <div className="p-6 font-[Poppins] max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add New Quiz</h1>

      {/* Select Course */}
      <label className="block font-medium mb-1">Select Course</label>
      <select
        className="w-full p-2 border rounded mb-3"
        value={selectedCourse?.id || ""}
        onChange={(e) =>
          setSelectedCourse(courses.find((c) => c.id === e.target.value))
        }
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      {/* Select Module */}
      <label className="block font-medium mb-1">Select Module</label>
      <select
        className="w-full p-2 border rounded mb-3"
        value={selectedModule?.id || ""}
        onChange={(e) =>
          setSelectedModule(modules.find((m) => m.id === e.target.value))
        }
      >
        {modules.map((m) => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>

      {/* Quiz Title */}
      <label className="block font-medium mb-1">Quiz Title</label>
      <input
        className="w-full p-2 border rounded mb-3"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      {/* Questions */}
      <h2 className="text-xl font-semibold mb-2">Questions</h2>
      {questions.map((q, i) => (
        <div key={i} className="border p-3 rounded mb-3 space-y-2">
          <div className="flex justify-between items-center">
            <label>Question {i + 1}</label>
            <button className="text-red-500 text-sm" onClick={() => removeQuestion(i)}>Remove</button>
          </div>
          <input
            className="w-full p-1 border rounded"
            placeholder="Enter question"
            value={q.question}
            onChange={(e) => {
              const temp = [...questions];
              temp[i].question = e.target.value;
              setQuestions(temp);
            }}
          />
          {q.options.map((opt, j) => (
            <input
              key={j}
              className="w-full p-1 border rounded mt-1"
              placeholder={`Option ${j + 1}`}
              value={opt}
              onChange={(e) => {
                const temp = [...questions];
                temp[i].options[j] = e.target.value;
                setQuestions(temp);
              }}
            />
          ))}
          <label>Correct Answer (0-3)</label>
          <input
            type="number"
            min="0"
            max="3"
            className="w-full p-1 border rounded"
            value={q.correct}
            onChange={(e) => {
              const temp = [...questions];
              temp[i].correct = Number(e.target.value);
              setQuestions(temp);
            }}
          />
        </div>
      ))}

      <button
        className="bg-[var(--primary)] text-white px-4 py-2 rounded mr-2"
        onClick={addQuestion}
      >
        Add Question
      </button>

      <button
        className="bg-[var(--primary)] text-white px-4 py-2 rounded"
        onClick={handleAddQuiz}
      >
        Save Quiz
      </button>
    </div>
  );
};

export default AddQuizPage;
