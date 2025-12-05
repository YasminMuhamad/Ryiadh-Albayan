import React, { useState } from "react";
import ModuleItem from "./ModuleItem";

export default function ModuleList({ modulesLocal, setModulesLocal, lessonsMapLocal, setLessonsMapLocal, loadingInitial, saving }) {
    const [addingModuleTitle, setAddingModuleTitle] = useState("");

    const addModuleLocal = () => {
        const title = addingModuleTitle.trim();
        if (!title) return;
        const tempId = `temp_${Date.now()}`;
        setModulesLocal(prev => [...prev, { id: tempId, title, _state: 'new' }]);
        setLessonsMapLocal(prev => ({ ...prev, [tempId]: [] }));
        setAddingModuleTitle("");
    };

    return (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <h3>Add Module (local)</h3>
            <div className="flex gap-2 mb-4">
                <input value={addingModuleTitle} onChange={e => setAddingModuleTitle(e.target.value)} placeholder="Module title" />
                <button onClick={addModuleLocal} disabled={!addingModuleTitle.trim()}>Add</button>
            </div>

            {modulesLocal.map(m => (
                <ModuleItem
                    key={m.id} module={m}
                    modulesLocal={modulesLocal} setModulesLocal={setModulesLocal}
                    lessonsMapLocal={lessonsMapLocal} setLessonsMapLocal={setLessonsMapLocal}
                    saving={saving}
                />
            ))}
        </div>
    );
}
