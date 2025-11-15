import React from "react";
import CategoryDropdown from "../../components/categorydropdown";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  

  useEffect(() => {
    
    
    axios.get("import.meta.env.VITE_COURSES_API_URL")
      .then(res => {
        
          setCourses(res.data.data);
          
        
      })
      .catch(err => {
       
          console.log(err);
          
        
      });

    
  }, []); 

    
    const filtered = courses.filter((c) => {
  const matchCategory =
    selectedCategory === "All Categories" || c.category === selectedCategory;

  const matchSearch =
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase());

  return matchCategory && matchSearch;
});


  
 
  
    
  return (
    <>
    <div className="mt-10"> 
      <h3 className="heading-1 flex justify-center">Explore Our Courses</h3>
      <p className="flex justify-center">Choose from our comprehensive selection of recorded courses and interactive live sessions</p>
</div>

     <div className=" flex justify-center gap-4 max-w-5xl mx-auto mt-10">


      <div className="flex items-center w-full bg-[#fdfbf7] rounded-full px-5 py-3 shadow-lg ">
        <svg
          className="w-5 h-5 text-gray-400 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
        <input
  type="text"
  placeholder="Search courses..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder:text-gray-400"
/>

      </div>
       
      
      <CategoryDropdown
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
</div>

    <div className="max-w-5xl mx-auto mt-8 grid gap-6 md:grid-cols-3">
        {filtered.map((course, index) => (
          <div
            key={course.id}
             className="group bg-white rounded-2xl p-5 shadow-sm transition-all duration-300 ease-out hover:scale-110 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full flex-1"
            
          >
          <div className="opacity-0 animate-fadeUp flex flex-col h-full"
          style={{ 
              animationDelay: `${index * 100}ms`
            }}>

            <div className="overflow-hidden rounded-lg">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg transform transition-transform duration-500 hover:scale-110 mb-4"
              />
            </div>
            <span className="inline-block bg-[#e6d8a6] text-gray-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit">
              {course.category}
            </span>
            <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
            <div className="mb-3 flex-grow">
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            </div>
            <p className="text-xs text-emerald-700 mb-3">Instructor: {course.teacher}</p>

            {/* الأيقونات */}
            <div className="flex items-center gap-6 text-gray-600 text-sm mb-4">
              <div className="flex items-center gap-2">
                {/* ⏱ أيقونة المدة */}
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                </svg>
                <span>10 weeks</span>
              </div>

              <div className="flex items-center gap-2">
                {/* 👥 أيقونة الطلبة */}
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
                  />
                  <circle cx="9" cy="7" r="4" strokeWidth="2" />
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M23 21v-2a4 4 0 0 0-3-3.87"
                  />
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 3.13a4 4 0 0 1 0 7.75"
                  />
                </svg>
                <span>98 students</span>
              </div>
            </div>

            {/* السعر + الأزرار */}
            <div className=" flex items-center justify-between pt-2 border-t border-gray-100 ">
              <p className="text-emerald-700  text-xl">
                ${course.price}
              </p>

            
      <div className="flex items-center gap-3 transition-transform duration-500 ease-out ">
          <button 
            onClick={() => navigate(`/courses/${course.id}`)}
            className=" px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-[#e6d8a6] font-semibold text-sm transition-all duration-300 hover:shadow-md hover:scale-105"
          >
            Details
          </button>
          <button className="px-5 py-2 rounded-full bg-[#2f7d73] text-white hover:bg-[#25685f] font-semibold text-sm transition-all duration-300 hover:shadow-md hover:scale-105 ">
            Enroll Now
          </button>
        </div>
        </div>
      </div>
      </div>

    ))}
    </div>
    </>
  );
}
