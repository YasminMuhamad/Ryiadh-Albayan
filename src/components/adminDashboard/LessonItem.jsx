
import React from 'react';
import { Trash } from 'lucide-react';

export default function LessonItem({ lesson, moduleId, editLessonLocal, toggleDeleteLessonLocal, editLessonMaterialLocal, saving }) {
  return (
    <div className="p-3 bg-[#F9FAFB] rounded border">
      {/* Lesson title + content */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <input
            value={lesson.title}
            onChange={(e) => editLessonLocal(moduleId, lesson.id, 'title', e.target.value)}
            className="w-full p-1 rounded border bg-white focus:outline-none"
            placeholder="Lesson title"
          />
          <textarea
            value={lesson.content}
            onChange={(e) => editLessonLocal(moduleId, lesson.id, 'content', e.target.value)}
            className="w-full mt-1 p-1 rounded border bg-white focus:outline-none text-sm"
            placeholder="Lesson content (optional)"
          />
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => toggleDeleteLessonLocal(moduleId, lesson.id)}
            className="text-red-500 text-xs flex items-center gap-1"
          >
            <Trash className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Materials */}
      <div className="mt-2 space-y-2">
        {(lesson.materials || []).map((mat, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              placeholder="Material title"
              value={mat.title}
              onChange={(e) => editLessonMaterialLocal(moduleId, lesson.id, idx, 'title', e.target.value)}
              className="p-1 rounded border bg-white focus:outline-none flex-1"
            />
            <input
              placeholder="Material file URL"
              value={mat.file}
              onChange={(e) => editLessonMaterialLocal(moduleId, lesson.id, idx, 'file', e.target.value)}
              className="p-1 rounded border bg-white focus:outline-none flex-1"
            />
            <select
              value={mat.type || 'file'}
              onChange={(e) => editLessonMaterialLocal(moduleId, lesson.id, idx, 'type', e.target.value)}
              className="p-1 rounded border bg-white focus:outline-none"
            >
              <option value="pdf">Pdf</option>
              <option value="pptx">Ppt</option>
            </select>
            <button
              onClick={() => editLessonLocal(moduleId, lesson.id, 'materials', (lesson.materials || []).filter((_, i) => i !== idx))}
              className="text-red-500 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );

}
