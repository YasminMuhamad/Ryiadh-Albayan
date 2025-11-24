import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({ options = [], value, onChange, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div
        className="w-full bg-[#F5F3ED] rounded-2xl p-2 border border-[#DBE9E5] flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${value ? "" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown className="w-4 h-4" />
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full bg-white border border-[#DBE9E5] rounded-2xl shadow-lg mt-1 max-h-60 bottom-10">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-[#E9D8A6] rounded-2xl"
              onClick={() => handleSelect(option.label)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}