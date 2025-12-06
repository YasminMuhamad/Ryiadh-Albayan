// components/QuizGenerator.jsx
import React, { useContext, useState } from "react";
import { TeacherContext } from "../context/TeacherContext.jsx";

export default function QuizGenerator({ courseId }) {
  const { courses, generateQuizLocally, saveQuizToFirestore } = useContext(TeacherContext);
  const course = courses.find((c) => c.id === courseId);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("");

  if (!course) return <div>Loading course...</div>;

  const handleGenerate = (type = "mcq") => {
    setStatus("Generating...");
    try {
      const qs = generateQuizLocally(course, { type, count: 6 });
      setQuestions(qs);
      setStatus("Generated locally");
    } catch (err) {
      console.error(err);
      setStatus("Error generating");
    }
  };

  const handleSave = async () => {
    setStatus("Saving...");
    const payload = {
      title: `Auto Quiz - ${course.title}`,
      courseId: course.id,
      questions,
      createdBy: course.teacherId || null,
    };
    const res = await saveQuizToFirestore(payload);
    if (res.ok) {
      setStatus(`Saved (id: ${res.id})`);
    } else {
      setStatus(`Save failed: ${res.error}`);
    }
  };

  return (
    <div className="p-4 bg-[var(--card)] rounded-[var(--radius)]">
      <h3 className="text-lg font-semibold mb-2">Quiz Generator — {course.title}</h3>

      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => handleGenerate("mcq")} className="px-3 py-1 bg-[var(--primary)] text-white rounded">Generate MCQ</button>
        <button onClick={() => handleGenerate("tf")} className="px-3 py-1 bg-[var(--secondary)] text-white rounded">Generate T/F</button>
        <button onClick={() => handleGenerate("short")} className="px-3 py-1 border rounded">Generate Short Answer</button>
        <button onClick={handleSave} className="ml-auto px-3 py-1 bg-green-600 text-white rounded">Save to Firestore</button>
      </div>

      <p className="text-sm text-[var(--foreground)]/70 mb-3">{status}</p>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-3 bg-white rounded shadow-sm">
            <p className="font-medium">{idx + 1}. {q.question}</p>

            {q.type === "mcq" && (
              <ul className="mt-2 list-disc list-inside">
                {q.options.map((opt, i) => (
                  <li key={i} className={opt.isCorrect ? "font-semibold text-[var(--primary)]" : ""}>
                    {opt.text}
                  </li>
                ))}
              </ul>
            )}

            {q.type === "tf" && <p className="mt-2">Options: True / False — Correct: {q.correctAnswer}</p>}
            {q.type === "short" && <p className="mt-2">Correct: {q.correctAnswer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
