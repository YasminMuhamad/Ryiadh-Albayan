// ../../components/Skeleton.jsx
import React from "react";
import clsx from "clsx";

/**
 * Skeleton Component
 * @param {string} className - Tailwind classes to control size & shape
 */
export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
        className
      )}
    />
  );
}

export default Skeleton;