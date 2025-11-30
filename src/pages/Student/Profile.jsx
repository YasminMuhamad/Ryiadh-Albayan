import React from "react";

export default function StudentProfile() {
  const courses = [
    {
      title: "Advanced Mathematics",
      teacher: "Dr. Ahmed Hassan",
      progress: 72,
      img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Physics - Mechanics",
      teacher: "Prof. Sara Ibrahim",
      progress: 58,
      img: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=800&q=60",
    },
    {
      title: "Organic Chemistry",
      teacher: "Dr. Khaled Mahmoud",
      progress: 85,
      img: "https://images.unsplash.com/photo-1581091870627-3b5c2a505a1b?auto=format&fit=crop&w=800&q=60",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8" style={{ backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: 'Poppins, Cairo, sans-serif' }}>
      {/* Header */}
      <div className="p-6 rounded-2xl shadow flex items-center justify-between" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=60"
            alt="profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--primary)" }}>Layla Ahmed</h2>
            <p className="text-gray-500 text-sm">Grade 11 - Science Track</p>
            <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full" style={{ backgroundColor: "var(--secondary)", color: "var(--foreground)" }}>
              Active
            </span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--primary)" }}>
          Edit Profile
        </button>
      </div>

        <div className="p-6 rounded-2xl shadow space-y-3" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold" style={{ color: "var(--primary)" }}>Personal Information</h3>
          <div>
            <p className="text-xs text-gray-400">Email Address</p>
            <p>layla.ahmed@student.edu</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Phone Number</p>
            <p>+20 123 456 7890</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Birth Date</p>
            <p>May 15, 2008</p>
          </div>
        </div>

        {/* Account Information */}
        

      {/* Courses */}
      <div className="p-6 rounded-2xl shadow" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h3 className="font-semibold mb-4" style={{ color: "var(--primary)" }}>My Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div key={i} className="rounded-2xl shadow overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <img src={course.img} alt="course" className="h-32 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h4 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{course.title}</h4>
                <p className="text-xs text-gray-500">{course.teacher}</p>

                <p className="text-xs">Progress</p>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${course.progress}%`, backgroundColor: "var(--primary)" }}
                  ></div>
                </div>
                <button className="w-full mt-2 px-4 py-2 rounded-xl border" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
