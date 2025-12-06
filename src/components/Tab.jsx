import React from "react";
export function Tab({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "recorded", title: "Recorded Courses" },
    { key: "interactive", title: "Interactive Courses" },
    { key: "progress", title: "Progress" },
  ];

  return (
    <div className="flex gap-2 px-2 py-1.5 font-medium rounded-full bg-[#E9D8A6]/20 w-fit mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-6 sm:px-10 lg:px-20 py-1.5 font-medium rounded-full
            ${activeTab === tab.key ? "bg-white text-black" : "text-black"}
          `}
        >
          {tab.title}
        </button>
        
      ))}
    </div>
  );
}
