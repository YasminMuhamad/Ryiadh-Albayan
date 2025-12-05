import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cartCourses, setCartCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch teachers
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const teachersList = teachersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAllCourses(coursesList);
      setTeachers(teachersList);

      // Fetch cart from localStorage
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartCoursesData = coursesList.filter(course => 
        savedCart.includes(course.id)
      );
      setCartCourses(cartCoursesData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get teacher name
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Professional Instructor';
  };

  // Remove from cart
  const removeFromCart = (courseId) => {
    const updatedCart = cartCourses.filter(course => course.id !== courseId);
    setCartCourses(updatedCart);
    
    // Update localStorage
    const cartIds = updatedCart.map(course => course.id);
    localStorage.setItem('cart', JSON.stringify(cartIds));
    
    // Trigger custom event to update navbar counter
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Removed from cart');
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartCourses.reduce((total, course) => {
      const price = typeof course.price === 'number' ? course.price : parseFloat(course.price || 0);
      return total + price;
    }, 0);
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      }
    }
    return stars;
  };

  // Proceed to checkout (all courses)
  const proceedToCheckout = () => {
    if (cartCourses.length === 0) return;
    
    // Send all cart courses to checkout via navigation state (first ID used for route)
    navigate(`/checkout/${cartCourses[0].id}`, { state: { cartCourses } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading your cart...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="self-start mb-4 inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <p className="text-gray-600 text-lg">Courses added to shopping cart</p>
        </div>

        {cartCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Courses List */}
            <div className="lg:col-span-2 space-y-6">
              {cartCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Course Image */}
                    <div className="md:w-48 h-48 md:h-auto">
                      <img
                        src={course.thumbnail || course.image || '/api/placeholder/400/300'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/api/placeholder/400/300'; }}
                      />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block">
                            {course.category}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                          
                          {/* Rating */}
                          <div className="flex items-center mb-3">
                            <div className="flex items-center mr-2">
                              {renderStars(typeof course.rating === 'number' ? course.rating : 0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 mr-1">
                              {typeof course.rating === 'number' ? course.rating : '0'}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({typeof course.reviewsCount === 'number' ? course.reviewsCount : '0'})
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(course.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Remove from cart"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <p className="text-sm text-teal-700 mb-4">
                        Instructor: {getTeacherName(course.teacherId)}
                      </p>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-teal-600">
                          ${typeof course.price === 'number' ? course.price : (course.price || 'Free')}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors text-sm"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => navigate(`/checkout/${course.id}`)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                          >
                            Buy Individual
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                {/* Course Count */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Number of Courses</span>
                  <span className="font-semibold">{cartCourses.length}</span>
                </div>

                {/* Individual Prices */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  {cartCourses.map((course) => (
                    <div key={course.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 truncate flex-1 mr-2">{course.title}</span>
                      <span className="font-medium">${course.price}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-teal-600">${getTotalPrice().toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  disabled={cartCourses.length === 0}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout ({cartCourses.length} courses)
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  * You will be able to access the courses immediately after payment
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Shopping Cart is Empty</h3>
              <p className="text-gray-600 mb-8">You haven't added any courses to your cart yet</p>
              <button
                onClick={() => navigate('/courses')}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
              >
                Go to Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
