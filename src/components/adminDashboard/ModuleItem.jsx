
import React from 'react';
import { Trash } from 'lucide-react';
import LessonItem from './LessonItem';

export default function ModuleItem({ module, lessons, editModuleTitleLocal, toggleDeleteModuleLocal, editLessonLocal, addLessonLocal, toggleDeleteLessonLocal, editLessonMaterialLocal, saving }) {
  return (
    <div className={`bg-white border rounded p-4 ${module._state === 'deleted' ? 'opacity-50' : ''}`}>
      {/* Module title + delete */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <input
            value={module.title}
            onChange={(e) => editModuleTitleLocal(module.id, e.target.value)}
            className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Module ID: {module.id}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => toggleDeleteModuleLocal(module.id)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded ${module._state === 'deleted' ? 'bg-yellow-100' : 'bg-red-50 text-red-600'}`}
            disabled={saving}
          >
            <Trash className="h-4 w-4" />
            {module._state === 'deleted' ? 'Undo' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Lessons */}
      <div className="mt-4 space-y-2">
        {lessons.filter(ls => ls._state !== 'deleted').map(ls => (
          <LessonItem key={ls.id} lesson={ls} moduleId={module.id} editLessonLocal={editLessonLocal} toggleDeleteLessonLocal={toggleDeleteLessonLocal} editLessonMaterialLocal={editLessonMaterialLocal} saving={saving} />
        ))}

        {/* Add new lesson */}
        <div className="flex gap-2 mt-2">
          <input id={`newLessonTitle_${module.id}`} placeholder="New lesson title" className="flex-1 p-2 rounded border bg-[#F5F3ED] focus:outline-none" />
          <button
            onClick={() => {
              const title = document.getElementById(`newLessonTitle_${module.id}`).value.trim();
              if (!title) return;
              addLessonLocal(module.id, title);
              document.getElementById(`newLessonTitle_${module.id}`).value = "";
            }}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Add Lesson
          </button>
        </div>
      </div>
    </div>
  );
}
