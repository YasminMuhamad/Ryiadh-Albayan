import React, { useState } from "react";
import LessonItem from "./LessonItem";
import { Trash } from 'lucide-react';

export default function ModuleItem({ module, modulesLocal, setModulesLocal, lessonsMapLocal, setLessonsMapLocal, saving }) {
    const toggleDeleteModuleLocal = (moduleId) => {
        setModulesLocal(prev => prev.map(m => {
            if (m.id !== moduleId) return m;
            if (m._state === 'new') return null;
            return { ...m, _state: (m._state === 'deleted' ? 'unchanged' : 'deleted') };
        }).filter(Boolean));
    };

    return (
        <div className={`p-4 border rounded ${module._state === 'deleted' ? 'opacity-50' : ''}`}>
            <div className="flex justify-between">
                <input value={module.title} onChange={e => setModulesLocal(prev => prev.map(m => m.id === module.id ? { ...m, title: e.target.value, _state: m._state==='new'?'new':'modified'} : m))} disabled={saving} />
                <button onClick={() => toggleDeleteModuleLocal(module.id)}><Trash /></button>
            </div>

            <div className="mt-2">
                {(lessonsMapLocal[module.id] || []).map(ls => (
                    <LessonItem key={ls.id} lesson={ls} moduleId={module.id} lessonsMapLocal={lessonsMapLocal} setLessonsMapLocal={setLessonsMapLocal} />
                ))}
            </div>
        </div>
    );
}
