import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Helper functions for instructor data
const getInstructorImage = (teacherName) => {
  const images = {
    "Sheikh Ahmed Al-Hassan": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "Sheikh Musa Al-Khaled": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    "Dr. Sarah Al-Harbi": "https://images.unsplash.com/photo-1494790108755-2616c27d34cf?w=150",
    "Dr. Mohammed Al-Faruq": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    "Ustadh Yasir Khan": "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150",
    "Sheikh Abdullah Al-Rashid": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150",
    "Ms. Lina Al-Masri": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    "Sheikh Omar Al-Hafiz": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  };
  return images[teacherName] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
};

const getInstructorEmail = (teacherName) => {
  const emails = {
    "Sheikh Ahmed Al-Hassan": "ahmed.hassan@riyadhalbayan.com",
    "Sheikh Musa Al-Khaled": "musa.khaled@riyadhalbayan.com",
    "Dr. Sarah Al-Harbi": "sarah.harbi@riyadhalbayan.com",
    "Dr. Mohammed Al-Faruq": "mohammed.faruq@riyadhalbayan.com",
    "Ustadh Yasir Khan": "yasir.khan@riyadhalbayan.com",
    "Sheikh Abdullah Al-Rashid": "abdullah.rashid@riyadhalbayan.com",
    "Ms. Lina Al-Masri": "lina.masri@riyadhalbayan.com",
    "Sheikh Omar Al-Hafiz": "omar.hafiz@riyadhalbayan.com"
  };
  return emails[teacherName] || "instructor@riyadhalbayan.com";
};

const getInstructorBio = (teacherName) => {
  const bios = {
    "Sheikh Ahmed Al-Hassan": "Expert in Quran recitation and Tajweed with certification from Al-Azhar University. 15+ years of teaching experience.",
    "Sheikh Musa Al-Khaled": "Master of Tajweed arts and Quranic sciences with 20+ years of experience in Islamic education.",
    "Dr. Sarah Al-Harbi": "PhD in Arabic Literature, specialized in Quranic Arabic with 12+ years of teaching experience.",
    "Dr. Mohammed Al-Faruq": "Islamic scholar and professor of Islamic theology with 18+ years in academic and practical Islamic studies.",
    "Ustadh Yasir Khan": "Specialist in Islamic history and prophetic biography with 10+ years of teaching experience.",
    "Sheikh Abdullah Al-Rashid": "Expert in Islamic jurisprudence and worship practices with 22+ years of scholarly experience.",
    "Ms. Lina Al-Masri": "Arabic language teacher specialized in beginner education with 8+ years of experience.",
    "Sheikh Omar Al-Hafiz": "Hafiz of the Quran with expertise in memorization techniques and 14+ years of teaching experience."
  };
  return bios[teacherName] || "Experienced Islamic scholar and educator specializing in Islamic studies and Arabic language.";
};

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`https://nadaalinashar1.retool.com/url/courses?environment=staging`);
        const foundCourse = response.data.data.find(c => c.id === parseInt(id));
        setCourse(foundCourse);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h2>
          <button 
            onClick={() => navigate('/courses')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/courses')}
          className="mb-6 flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="relative mb-6 overflow-hidden rounded-2xl">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover transition-all duration-700 ease-in-out hover:scale-125 hover:brightness-110"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Recorded Course
                </span>
              </div>
            </div>

            {/* Course Title & Description */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-gray-700 leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">10 weeks</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{course.category}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Enrolled Students</p>
                    <p className="font-semibold text-gray-900">98 students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Instructor */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h2>
              <div className="flex items-start space-x-4">
                <img 
                  src={getInstructorImage(course.teacher)} 
                  alt={course.teacher}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{course.teacher}</h3>
                  <p className="text-sm text-gray-600 mb-2">{getInstructorEmail(course.teacher)}</p>
                  <p className="text-gray-700">
                    {getInstructorBio(course.teacher)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-3xl font-bold text-teal-600">${course.price}</span>
                </div>
                <p className="text-gray-500">One-time payment</p>
              </div>

              {/* Enroll Button */}
              <button className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:-translate-y-1 transform mb-6">
                Enroll Now
              </button>

              {/* Course Details */}
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Access</span>
                  <span className="font-medium">Lifetime</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Format</span>
                  <span className="font-medium">Video</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Certificate</span>
                  <span className="font-medium">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}