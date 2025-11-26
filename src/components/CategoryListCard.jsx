// src/components/CategoryListCard.jsx
import React from "react";
import { DashCard } from "./DashCard";

export default function CategoryListCard({
  items = [],
}) {
  return (
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: it.color }}
              />
              <span className="text-sm">{it.name}</span>
            </div>
            <span className="text-sm font-medium">{it.value}</span>
          </div>
        ))}
      </div>
  );
}