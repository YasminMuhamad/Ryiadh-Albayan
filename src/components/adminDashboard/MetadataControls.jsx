import React from "react";

export default function MetadataControls({ selectedCategory, setSelectedCategory, selectedStatus, setSelectedStatus, selectedType, setSelectedType, categories, STATUS_OPTIONS, TYPE_OPTIONS, loadingInitial, saving }) {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm mb-1">Category</label>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
          disabled={loadingInitial || saving}
        >
          <option value="">-- Select category --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
          disabled={loadingInitial || saving}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full p-2 rounded border bg-[#F9FAFB] focus:outline-none"
          disabled={loadingInitial || saving}
        >
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );

}
