// src/components/SearchBar.jsx
import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Search...", value, onChange }) {
  return (
    // Search icon inside the input field
    <div>
      <div className="relative text-gray-600">
        <input
          type="text"
          className="w-full"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button type="submit" className="absolute right-0 top-0 mt-2 mr-4">
          <Search />
        </button>
      </div>
    </div>
  );
}
