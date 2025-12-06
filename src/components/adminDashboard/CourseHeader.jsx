import React from "react";
import Title from "../Title";
import Spinner from "../Spinner";

export default function CourseHeader({ course, courseId, setActiveTab, handleCancel, handleSave, saving, loadingInitial }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <button
          onClick={() => setActiveTab && setActiveTab("courses")}
          className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          ← Back
        </button>
      </div>

      <div className="text-center">
        <Title enTitle='Course Content' arTitle='محتوى الكورس' />
        <p className="text-sm text-gray-500">{course ? course.title : `Course ID: ${courseId}`}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCancel}
          disabled={loadingInitial || saving}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loadingInitial || saving}
          className="px-3 py-1 rounded bg-[#0E7C7B] text-white disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving && <Spinner />}
          Save
        </button>
      </div>
    </div>
  );
}
