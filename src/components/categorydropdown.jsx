import { useMemo, useState } from "react";

export default function CategoryDropdown({ value, onChange, categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen((v) => !v);

  const options = useMemo(() => {
    const items = Array.isArray(categories) ? categories : [];
    const cleaned = items
      .map((c) => (c?.name ? String(c.name) : typeof c === "string" ? c : ""))
      .filter(Boolean);
    const unique = Array.from(new Set(["All Categories", ...cleaned]));
    return unique;
  }, [categories]);

  const handleSelect = (cat) => {
    onChange?.(cat);      // نبعت الاختيار للأب
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block min-w-[200px]">
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full flex items-center justify-between bg-[#fdfbf7] rounded-full px-5 py-3 shadow-lg text-sm font-semibold text-gray-900 hover:shadow-xl transition-shadow"
      >
        <span>{value}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden z-20 animate-fadeIn">
          {options.map((cat) => {
            const isSelected = cat === value;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full flex items-center justify-between px-5 py-2.5 text-sm ${
                  isSelected ? "bg-[#e6d8a6] text-gray-900" : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
