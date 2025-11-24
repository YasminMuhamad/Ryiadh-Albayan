// src/components/ConfirmModal.jsx
import React from "react";
import { X } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] relative shadow-lg">
        <X
          className="absolute top-4 right-4 w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
          onClick={onClose}
        />
        <h2 className="text-lg font-semibold mb-2">{title || "Confirm Action"}</h2>
        <p className="text-gray-600 mb-4">{message || "Are you sure?"}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}