import React from "react";
export default function CategoryManager({ categories, setCategories, newCategoryTitle, setNewCategoryTitle, selectedCategory, setSelectedCategory, setConfirmModal, saving, loadingInitial }) {
    const handleAddCategory = () => {
        if (!newCategoryTitle.trim()) return;
        setConfirmModal({ isOpen: true, title: 'Add Category', message: `Add ${newCategoryTitle}?`, onConfirm: async () => { /* addDoc */ } });
    };

    return (
        <div className="p-4 bg-white border rounded mt-4">
            <h3>Manage Categories</h3>
            <div className="flex gap-2 mb-3">
                <input value={newCategoryTitle} onChange={e => setNewCategoryTitle(e.target.value)} disabled={saving || loadingInitial} />
                <button onClick={handleAddCategory} disabled={!newCategoryTitle.trim()}>Add</button>
            </div>
            {categories.map(c => (
                <div key={c.id} className="flex gap-2 mb-1">
                    <input value={c.title} onChange={e => setCategories(prev => prev.map(cat => cat.id===c.id ? {...cat,title:e.target.value}:cat))} disabled={saving || loadingInitial} />
                    <button>Save</button>
                    <button>Delete</button>
                </div>
            ))}
        </div>
    );
}
