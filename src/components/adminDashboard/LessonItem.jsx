import React from "react";
import { Trash } from 'lucide-react';

export default function LessonItem({ lesson, moduleId, lessonsMapLocal, setLessonsMapLocal }) {
    const editLessonLocal = (field, value) => {
        setLessonsMapLocal(prev => {
            const list = (prev[moduleId] || []).map(ls => ls.id === lesson.id ? { ...ls, [field]: value, _state: ls._state==='new'?'new':'modified'} : ls);
            return { ...prev, [moduleId]: list };
        });
    };

    const toggleDeleteLessonLocal = () => {
        setLessonsMapLocal(prev => {
            const list = (prev[moduleId] || []).map(ls => ls.id === lesson.id ? { ...ls, _state: ls._state==='deleted'?'unchanged':'deleted'} : ls);
            return { ...prev, [moduleId]: list };
        });
    };

    return (
        <div className="p-2 border rounded mb-2">
            <div className="flex justify-between">
                <input value={lesson.title} onChange={e => editLessonLocal('title', e.target.value)} />
                <button onClick={toggleDeleteLessonLocal}><Trash /></button>
            </div>
            <textarea value={lesson.content} onChange={e => editLessonLocal('content', e.target.value)} />
        </div>
    );
}
