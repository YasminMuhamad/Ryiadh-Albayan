import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase.config";
import CategoryDropdown from "../../components/categorydropdown";

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState(["All Categories"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from Firebase...");
        
        const [coursesSnapshot, teachersSnapshot] = await Promise.all([
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "teachers")),
        ]);

        // Process courses
        const coursesList = coursesSnapshot.docs.map((doc) => {
          const data = doc.data();
          // Convert any Firebase Timestamps to strings or handle them properly
          const processedData = { ...data };
          
          // Convert timestamps to strings if they exist
          if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt.toDate) {
            processedData.createdAt = data.createdAt.toDate().toISOString();
          }
          
          // Ensure all fields are primitive values, not objects
          Object.keys(processedData).forEach(key => {
            const value = processedData[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              // Convert Firebase objects to strings or numbers as appropriate
              if (value.toDate && typeof value.toDate === 'function') {
                processedData[key] = value.toDate().toISOString();
              } else if (value.toString && typeof value.toString === 'function') {
                processedData[key] = value.toString();
              }
            }
          });
          
          return {
            id: doc.id,
            ...processedData,
          };
        });
        
        // Process teachers
        const teachersList = teachersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Courses fetched:", coursesList);
        console.log("Teachers fetched:", teachersList);
        
        // Debug: Check if any course has object values that might cause render issues
        coursesList.forEach(course => {
          Object.keys(course).forEach(key => {
            if (typeof course[key] === 'object' && course[key] !== null && !Array.isArray(course[key])) {
              console.warn(`Course ${course.id} has object value for ${key}:`, course[key]);
            }
          });
        });
        
        setCourses(coursesList);
        setTeachers(teachersList);
        const uniqueCategories = Array.from(
          new Set(
            coursesList
              .map((c) => c.category)
              .filter(Boolean)
          )
        );
        setCategories(["All Categories", ...uniqueCategories]);
        
        // Fetch cart from localStorage
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to get teacher name
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : "Unknown Teacher";
  };

  // Add/remove from cart
  const toggleCart = (courseId) => {
    let updatedCart;
    if (cart.includes(courseId)) {
      // Remove from cart
      updatedCart = cart.filter(id => id !== courseId);
    } else {
      // Add to cart
      updatedCart = [...cart, courseId];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Trigger custom event to update navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Check if course is in cart
  const isInCart = (courseId) => {
    return cart.includes(courseId);
  };

  // Render star rating (filled up to nearest whole number)
  const renderStars = (rating = 0) => {
    const stars = [];
    const value = Math.max(0, Math.min(5, Math.round(rating)));
    for (let i = 0; i < 5; i++) {
      const filled = i < value;
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading courses ...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading courses: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filtered = courses.filter((c) => {
    const matchCategory =
      selectedCategory === "All Categories" ||
      c.category === selectedCategory;
    const matchSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  
    
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mt-10"> 
        <h3 className="heading-1 flex justify-center">Explore Our Courses</h3>
        <p className="flex justify-center">Choose from our comprehensive selection of recorded courses and interactive live sessions</p>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-center gap-4 max-w-5xl mx-auto mt-10">
        <div className="flex items-center w-full bg-[#fdfbf7] rounded-full px-5  shadow-lg">
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
            className="w-full bg-transparent outline-none focus:outline-none focus:ring-0 focus:border-transparent text-sm text-gray-600 placeholder:text-gray-400"
          />
        </div>

        <CategoryDropdown 
          value={selectedCategory}
          categories={categories}
          onChange={setSelectedCategory}
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
        {filtered.map((course, idx) => (
          <div
            key={course.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${idx * 80}ms`, animationDuration: '0.8s' }}
          >
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ease-in-out relative flex flex-col h-full hover:scale-105 hover:transform cursor-pointer">
              {/* Recorded Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Recorded
                </span>
              </div>
              
              {/* Course Image */}
              <div className="relative h-64 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
                <img
                  src={course.thumbnail || '/api/placeholder/400/300'}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/300';
                  }}
                />
              </div>
              
              {/* Content */}
              <div className="p-6 pb-8 flex flex-col flex-grow">
                {/* Category Tag */}
                <div className="mb-4">
                  <span className="bg-amber-100 text-black px-4 py-2 rounded-full text-sm font-medium">
                    {course.category || 'Arabic Language'}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="font-bold  mb-3 text-gray-900 leading-tight">
                  {course.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 text-base mb-4 line-clamp-2 leading-relaxed flex-grow">
                  {course.description || 'Learn Classical Arabic grammar (Nahw) from the ground up. Perfect for beginners wanting...'}
                </p>
                
                {/* Instructor */}
                <p className="text-teal-600 font-medium text-base mb-6">
                  Instructor: {getTeacherName(course.teacherId) || 'Dr. Fatima Al-Zahra'}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-6 text-gray-800">
                  <div className="flex items-center gap-1">
                    {renderStars(Number(course.rating) || 0)}
                  </div>
                  <span className="font-semibold text-gray-900">{Number(course.rating) || 0}</span>
                  <span className="text-gray-500 text-sm">({course.reviewsCount || 0} reviews)</span>
                </div>
                
                {/* Course Stats */}
                <div className="flex items-center gap-6 mb-8 text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                    <span className="text-base">{course.totalLessons || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <span className="text-base">{course.totalModules || 0} modules</span>
                  </div>
                </div>
                
                {/* Price and Actions - This will be pushed to bottom */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-xl font-bold text-teal-600">
                    $ {typeof course.price === 'number' ? course.price : (course.price || '149')}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="px-8 py-3 bg-white hover:bg-amber-200 text-black hover:text-black rounded-full text-base font-medium transition-colors border border-gray-200 hover:border-amber-300"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => toggleCart(course.id)}
                      className={`p-3 rounded-full transition-colors ${
                        isInCart(course.id)
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-white hover:bg-gray-100 text-teal-600 border-2 border-teal-600'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293a1 1 0 00-.293.707v0a1 1 0 001 1h9m-1 0a2 2 0 104 0 2 2 0 00-4 0zm-9-4a2 2 0 100 4 2 2 0 000-4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "All Categories"
              ? "Try adjusting your search or filter criteria."
              : "No courses are currently available."}
          </p>
        </div>
      )}
    </div>
  );
}

    
