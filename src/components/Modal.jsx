import React, { useEffect } from "react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    function onKey(e){ if(e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return ()=> document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className={`relative bg-[var(--card)] rounded-xl shadow-lg p-6 w-full max-w-${size === "lg" ? "3xl" : "2xl"}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-start justify-between gap-4">
          <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-500">✕</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
