import React from 'react';
import { Plus } from 'lucide-react';

export default function AddModuleForm({ addingModuleTitle, setAddingModuleTitle, addModuleLocal, loadingInitial, saving }) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="font-medium mb-2">Add Module (local)</h3>
      <div className="flex gap-2">
        <input
          value={addingModuleTitle}
          onChange={(e) => setAddingModuleTitle(e.target.value)}
          placeholder="Module title"
          className="flex-1 p-2 rounded border bg-[#F5F3ED] focus:outline-none"
          disabled={loadingInitial || saving}
        />
        <button
          onClick={addModuleLocal}
          disabled={!addingModuleTitle.trim() || loadingInitial || saving}
          className="px-4 py-2 rounded bg-[#0E7C7B] text-white disabled:opacity-60 inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add (local)
        </button>
      </div>
    </div>
  );
}
