
import React from "react";
import photo1 from "../../assets/images/photo1.jpg"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";



// import { addNotification } from "../../services/notificationService";

const Home = () => {
  
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [reviews, setReviews] = useState([]);



  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));

        const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const teachersList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const reviewsList = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsList.slice(0, 3));

        setCourses(coursesList.slice(3, 6)); // أول ٣ كورسات للـ Featured Courses
        setTeachers(teachersList);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);


  return (
    <>
      <section className="bg-[#faf6f2] min-h-screen flex flex-col justify-start items-center text-center px-4 pt-24 relative">
        
        
        <div className="bg-[#e6f1ee] text-[#21746c] px-4 py-1 rounded-full mb-4 text-sm font-normal">
          بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
        </div>

        
        <h1 className="text-4xl md:text-6xl text-[#21746c] mb-4 font-normal">
          Riyad Al-Bayan Center
        </h1>

        
        <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl font-light">
          Learn Arabic & Islamic Studies with knowledge, faith, and understanding
        </p>

        
        <p className="text-gray-500 max-w-3xl mb-8 font-light leading-relaxed">
          Join thousands of students worldwide in their journey to master the Arabic language
          and deepen their understanding of Islamic sciences through our comprehensive online platform.
        </p>



              {/* <  button onClick={async () => {
              await addNotification({
                title: "Test Notification",
                message: "This is a test from Home page.",
                userIds: [],
              });
            }}>
              Send Notification

            </button> */}


        {/* <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button className="bg-[#21746c] hover:bg-[#1a5c56] text-white font-medium py-3 px-6 rounded-full transition duration-300">
            Start Learning Today
          </button>
          <button className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-full transition duration-300">
            Explore Courses
          </button>
        </div> */}

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-[90%] md:w-[70%] mb-12">

          
          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center hover:shadow-lg transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#21746c] mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75H4.5v-.75z" />
            </svg>

            <p className="text-3xl font-semibold text-[#21746c]">500+</p>
            <p className="text-gray-600 mt-1">Active Students</p>
          </div>

         
          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center hover:shadow-lg transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#21746c] mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c1.148 0 2.25.257 3.216.72a4.486 4.486 0 012.034 2.034c.463.966.72 2.068.72 3.216H6.03c0-1.148.257-2.25.72-3.216a4.486 4.486 0 012.034-2.034A8.222 8.222 0 0112 14.25zm0-9a3 3 0 100 6 3 3 0 000-6z" />
            </svg>

            <p className="text-3xl font-semibold text-[#21746c]">15+</p>
            <p className="text-gray-600 mt-1">Expert Instructors</p>
          </div>

          
          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center hover:shadow-lg transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-[#21746c] mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.25h18M3 12h18M3 18.75h18" />
            </svg>

            <p className="text-3xl font-semibold text-[#21746c]">30+</p>
            <p className="text-gray-600 mt-1">Comprehensive Courses</p>
          </div>

        </div>

       
        <div className="absolute inset-0 -z-10 opacity-10 bg-[url('/mosque-bg.jpg')] bg-cover bg-center"></div>
      </section>
    

    
<section className="py-20 bg-white flex justify-center">
  <div className="w-[90%] md:w-[80%] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

    
    <div>
      <img
        src={photo1} alt="course"
        className="rounded-xl shadow-md w-full object-cover"
      />
    </div>

    
    <div>
      <h3 className="text-sm text-[#21746c] font-medium tracking-wide mb-2">
        About Riyad Al-Bayan Center
      </h3>

      <p className="text-gray-700 leading-relaxed mb-6">
        Riyad Al-Bayan Center is a trusted online platform dedicated to teaching
        Arabic language and Islamic sciences to students around the globe. Our
        mission is to make authentic Islamic knowledge accessible to everyone,
        regardless of their location.
        <br /><br />
        We offer a comprehensive curriculum that includes Quranic studies, Arabic
        grammar, Islamic jurisprudence, and more. Our courses are taught by
        qualified scholars who combine traditional Islamic education with modern
        teaching methodologies.
        <br /><br />
        Whether you're a beginner starting your Arabic journey or an advanced
        student seeking deeper knowledge, we provide flexible learning options
        including recorded courses and live interactive sessions.
      </p>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

        <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-[#fafafa]">
          <h4 className="font-semibold text-gray-800 mb-1">Recorded Courses</h4>
          <p className="text-gray-600 text-sm">
            Learn at your own pace with comprehensive video lessons.
          </p>
        </div>

      
        <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-[#fafafa]">
          <h4 className="font-semibold text-gray-800 mb-1">Live Sessions</h4>
          <p className="text-gray-600 text-sm">
            Interactive Zoom classes with direct teacher engagement.
          </p>
        </div>

      </div>
    </div>
  </div>
</section>




{/* ===== FEATURED COURSES SECTION ===== */}
<section className="py-20 bg-[#faf6f2]">
  <div className="text-center mb-12">
    <h2 className="text-2xl md:text-3xl text-gray-800 font-semibold">
      Featured Courses
    </h2>
    <div className="w-16 h-[3px] bg-[#21746c] mx-auto mt-3 rounded"></div>
    <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
      Explore our most popular courses designed to build a strong foundation in Arabic
      and Islamic knowledge
    </p>
  </div>

  {/* Courses Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-[90%] md:w-[85%] mx-auto">
  {loadingCourses ? (
    <p>Loading courses...</p>
  ) : courses.length === 0 ? (
    <p>No courses available.</p>
  ) : (
    courses.map(course => (
      <div key={course.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition border border-gray-200">
        <div className="relative">
          <img 
            src={course.thumbnail || "/api/placeholder/400/300"} 
            alt={course.title} 
            className="rounded-t-2xl h-48 w-full object-cover" 
          />
          <span className="absolute top-3 right-3 bg-[#21746c] text-white text-xs px-3 py-1 rounded-full">
            {course.type || "Recorded"}
          </span>
        </div>

        <div className="p-6">
          <span className="bg-[#f7eecb] text-[#8a7a3a] text-xs px-3 py-1 rounded-full">
            {course.category || "General"}
          </span>

          <h3 className="mt-3 text-lg font-semibold text-gray-800">{course.title}</h3>
          <p className="text-gray-600 text-sm mt-2 mb-3">{course.description?.slice(0, 80)}...</p>
          <p className="text-sm text-[#21746c] font-medium underline mb-4">
            Instructor: {teachers.find(t => t.id === course.teacherId)?.name || "Unknown"}
          </p>

          {/* <div className="flex items-center gap-6 text-gray-600 text-sm mb-4">
            <div className="flex items-center gap-1">
              <span>⏳</span> {course.totalWeeks || 8} weeks
            </div>
            <div className="flex items-center gap-1">
              <span>👥</span> {course.studentsCount || 0} students
            </div>
          </div> */}

          <div className="flex items-center justify-between">
            <p className="text-[#21746c] font-semibold text-lg">${course.price || 149}</p>

        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/courses/${course.id}`)}
            className="px-6 py-3 rounded-full bg-[#21746c] text-white text-base font-medium hover:bg-[#1a5c56] transition-colors duration-300"
          >
            Show details
          </button>
        </div>


          </div>
        </div>
      </div>
    ))
  )}
</div>


  {/* View All Button */}
  <div className="flex justify-center mt-12">
  <button
    onClick={() => navigate("/courses")}
    className="px-8 py-3 rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-200 transition"
  >
    View All Courses
  </button>
</div>

</section>





{/* export default function TeachersTestimonials() { */}
  
    <div className="w-full bg-white font-['Inter']">
     {/* ===== Teachers Section ===== */}
<section className="py-16 max-w-7xl mx-auto px-4">
  <h2 className="text-center text-2xl font-semibold text-[#1D1D1F]">Meet Our Teachers</h2>
  <p className="text-center text-[#6E6E73] mt-2">
    Learn from qualified scholars with years of experience in Islamic education
  </p>

  <div className="grid md:grid-cols-3 gap-8 mt-12">
    {teachers.slice(0, 3).map((teacher) => (
      <div key={teacher.id} className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition">
        <img
          src={teacher.profile_pic}
          alt={teacher.name_ar}
          className="w-full h-56 object-fill rounded-lg"
        />
        <h3 className="mt-4 text-lg font-semibold text-[#1D1D1F]">{teacher.name_ar}</h3>
        <p className="text-[#6E6E73] text-sm mt-2">{teacher.specialization}</p>
        <p className="text-[#0E9F9F] text-sm mt-3">{teacher.email}</p>
      </div>
    ))}
  </div>
</section>


      

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-2xl font-semibold text-[#1D1D1F]">Student Testimonials</h2>
          <p className="text-center text-[#6E6E73] mt-2">
            Hear what our students say about their learning journey
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
    {reviews.map((review) => (
      <div
        key={review.studentId}
        className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition"
      >
        <p className="text-[#0E9F9F] text-4xl">“</p>

        <p className="text-gray-700 mt-2 text-sm">
          {review.content || "No comment available."}
        </p>
                {/* ⭐⭐⭐ Display static rating (no half stars) */}
         <div className="flex gap-1 mt-1">
        {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="text-yellow-500 text-lg">
          {index < review.rating ? "★" : "☆"}
        </span>
      ))}
    </div>

        <div className="flex items-center gap-3 mt-4">
          <div>
            <p className="font-medium text-[#1D1D1F] text-sm">
              {review.name || "Unknown Name"}
            </p>
            <p className="text-[#6E6E73] text-xs">
              {review.country || "Unknown Country"}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>

          
        </div>

        {/* CTA inside the same testimonials section */}
<div className="w-full bg-gradient-to-r from-teal-800 to-teal-600 py-14 mt-16 rounded-lg">
  <div className="max-w-3xl mx-auto text-center px-4">
    <h2 className="text-white text-lg font-semibold">
      Begin Your Learning Journey Today
    </h2>

    <p className="text-white mt-2 text-base">
      Join our community of dedicated learners and start your path to Islamic knowledge
    </p>

     <p className="mt-6 text-white text-lg font-medium italic">
      "Knowledge lights the path to a better tomorrow."
    </p>
  </div>
</div>

      </section>

    </div>

    </>
  );

};

export default Home;

