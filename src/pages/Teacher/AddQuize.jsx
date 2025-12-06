// src/pages/AddQuiz.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";
import { db } from "../../services/firebase.js";
import toast from "react-hot-toast";

export const AddQuiz = () => {
  const navigate = useNavigate();
  const { uid: teacherId } = useAuth();

  const [title, setTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correct: 0 }]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [teacherId]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedCourse) return;
      try {
        const q = query(collection(db, `courses/${selectedCourse}/modules`));
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

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "question") updated[index].question = value;
    else if (field.startsWith("option")) updated[index].options[parseInt(field.slice(-1))] = value;
    else if (field === "correct") updated[index].correct = parseInt(value);
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: 0 }]);
  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedModule) {
      toast("Please select a course and module!");
      return;
    }
    if (!title.trim()) {
      toast("Please enter a quiz title!");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { toast(`Question ${i + 1} is empty!`); return; }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) { toast(`Option ${j + 1} of question ${i + 1} is empty!`); return; }
      }
      if (q.correct < 0 || q.correct > 3) { toast(`Correct option of question ${i + 1} must be between 0 and 3!`); return; }
    }

    try {
      await addDoc(collection(db, `courses/${selectedCourse}/modules/${selectedModule}/quizzes`), {
        title,
        teacherId,
        questions,
        createdAt: Timestamp.fromDate(new Date()),
      });
      toast("Quiz added successfully!");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      toast("Failed to add quiz.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-1 text-center flex-1">Add New Quiz</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-primary px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label className="font-medium mb-1">Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Select Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            {modules.map(mod => (
              <option key={mod.id} value={mod.id}>{mod.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium mb-1">Quiz Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter quiz title"
          />
        </div>

        {questions.map((q, index) => (
          <div key={index} className="card animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Question {index + 1}</h2>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-red-500 font-medium"
              >
                Remove
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter the question here"
              value={q.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              required
              className="w-full border rounded px-3 py-2 mb-2"
            />

            <div className="grid grid-cols-2 gap-2 mb-2">
              {q.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleQuestionChange(index, `option${i}`, e.target.value)}
                  required
                  className="border rounded px-3 py-2"
                />
              ))}
            </div>

            <div>
              <label>Correct Option (0-3):</label>
              <input
                type="number"
                min="0"
                max="3"
                value={q.correct}
                onChange={(e) => handleQuestionChange(index, "correct", e.target.value)}
                required
                className="w-16 border rounded px-2 py-1 ml-2"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button type="button" onClick={addQuestion} className="btn-primary">Add Question</button>
          <button type="submit" className="btn-secondary">Save Quiz</button>
        </div>
      </form>
    </div>
  );
};

export default AddQuiz;
