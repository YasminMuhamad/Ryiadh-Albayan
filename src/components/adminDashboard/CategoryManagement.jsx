import React from "react";
export default function CategoryManagement({ categories, newCategoryTitle, setNewCategoryTitle, handleAddCategory, handleEditCategory, saveCategoryEdit, handleDeleteCategory, saving, loadingInitial }) {
  return (
    <div className="my-6 p-4 bg-white rounded-lg shadow-sm border">
      <h3 className="font-medium mb-2">Manage Categories</h3>

      <div className="flex gap-2 mb-3">
        <input
          placeholder="New category title"
          value={newCategoryTitle}
          onChange={(e) => setNewCategoryTitle(e.target.value)}
          className="flex-1 p-2 rounded border bg-[#F5F3ED] focus:outline-none"
          disabled={saving || loadingInitial}
        />
        <button
          onClick={handleAddCategory}
          disabled={!newCategoryTitle.trim() || saving || loadingInitial}
          className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center gap-2">
            <input
              value={c.title}
              onChange={(e) => handleEditCategory(c.id, e.target.value)}
              className="flex-1 p-1 rounded border bg-white focus:outline-none"
              disabled={saving || loadingInitial}
            />
            <button
              onClick={() => saveCategoryEdit(c.id, c.title)}
              className="px-2 py-1 bg-blue-100 text-blue-600 rounded"
              disabled={saving || loadingInitial}
            >
              Save
            </button>
            <button
              onClick={() => handleDeleteCategory(c.id)}
              className="px-2 py-1 bg-red-100 text-red-600 rounded"
              disabled={saving || loadingInitial}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
