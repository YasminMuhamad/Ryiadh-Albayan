import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const computeAverageRating = (reviews = []) => {
  const nums = reviews
    .map((r) => (typeof r?.rating === 'number' ? r.rating : parseFloat(r?.rating)))
    .filter((n) => !Number.isNaN(n));
  if (!nums.length) return 0;
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return Number((sum / nums.length).toFixed(1));
};

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid: userId, role } = useAuth();
  const [cartCourses, setCartCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesSnapshot, categoriesSnap] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'categories')),
      ]);
      const catMap = categoriesSnap.docs.reduce((acc, d) => {
        const data = d.data();
        acc[d.id] = data.title || data.name || d.id;
        return acc;
      }, {});
      setCategoriesMap(catMap);

      const courseDocs = coursesSnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
      const reviewsByCourse = {};

      await Promise.all(
        courseDocs.map(async ({ id }) => {
          try {
            const snap = await getDocs(collection(db, 'courses', id, 'reviews'));
            reviewsByCourse[id] = snap.docs.map((d) => d.data()).filter(Boolean);
          } catch (err) {
            reviewsByCourse[id] = [];
            console.error('Failed to fetch reviews for course', id, err);
          }
        })
      );

      const coursesList = coursesSnapshot.docs.map(doc => {
        const data = doc.data();
        const reviews = reviewsByCourse[doc.id] || [];
        const categoryId = data.categoryId || data.category;
        const categoryLabel = catMap[categoryId] || data.category || 'Course';
        return {
          id: doc.id,
          ...data,
          categoryId,
          category: categoryLabel,
          rating: computeAverageRating(reviews),
          reviewsCount: reviews.length
        };
      });

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
  const renderStars = (rating = 0) => {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(value);
    const hasHalf = value % 1 !== 0;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalf && (
          <svg key="half" className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <defs>
              <linearGradient id="half-star">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z"
            />
          </svg>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Proceed to checkout (all courses)
  const proceedToCheckout = () => {
    if (cartCourses.length === 0) return;
    if (!userId || role !== 'student') {
      setShowLoginModal(true);
      return;
    }
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
                              {typeof course.rating === 'number' ? course.rating.toFixed(1) : '0.0'}
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
                            onClick={() => {
                              if (!userId || role !== 'student') {
                                setShowLoginModal(true);
                                return;
                              }
                              navigate(`/checkout/${course.id}`);
                            }}
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
                  {`Proceed to Checkout (${cartCourses.length} courses)`}
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

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowLoginModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 animate-slideUp">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
                !
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">Sign in required</h4>
                <p className="text-sm text-gray-600">Please sign in with a student account before checkout.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login', { state: { from: location.pathname } });
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition shadow-md transform hover:-translate-y-0.5"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
