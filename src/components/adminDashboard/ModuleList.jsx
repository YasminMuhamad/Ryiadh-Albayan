import React from 'react';
import ModuleItem from './ModuleItem';
import Loader from '../Loader';

export default function ModuleList({ modulesLocal, lessonsMapLocal, editModuleTitleLocal, toggleDeleteModuleLocal, editLessonLocal, addLessonLocal, toggleDeleteLessonLocal, editLessonMaterialLocal, saving, loadingInitial }) {
  if (loadingInitial) return <p className="text-sm text-gray-500"><Loader /></p>;
  if (!loadingInitial && modulesLocal.length === 0) return <p className="text-sm text-gray-500">No modules yet. Add one above.</p>;

  return (
    <div className="space-y-4">
      {modulesLocal.map(m => (
        <ModuleItem
          key={m.id}
          module={m}
          lessons={lessonsMapLocal[m.id] || []}
          editModuleTitleLocal={editModuleTitleLocal}
          toggleDeleteModuleLocal={toggleDeleteModuleLocal}
          editLessonLocal={editLessonLocal}
          addLessonLocal={addLessonLocal}
          toggleDeleteLessonLocal={toggleDeleteLessonLocal}
          editLessonMaterialLocal={editLessonMaterialLocal}
          saving={saving}
        />
      ))}
    </div>
  );
}
