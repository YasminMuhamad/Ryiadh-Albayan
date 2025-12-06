import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import PayPalButton from '../../components/PayPalButton';
import CheckoutStepper from '../../components/CheckoutStepper';
import OrderSummaryCard from '../../components/OrderSummaryCard';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCoursesFromState = useMemo(() => location.state?.cartCourses || [], [location.state]);
  const { uid, profile } = useAuth();
  const [enrichedCartCourses, setEnrichedCartCourses] = useState(cartCoursesFromState);
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [categoriesMap, setCategoriesMap] = useState({});

  const fetchCourseReviews = async (courseId) => {
    try {
      const snap = await getDocs(collection(db, 'courses', courseId, 'reviews'));
      return snap.docs.map((d) => d.data()).filter(Boolean);
    } catch (err) {
      console.error('Failed to fetch reviews for course', courseId, err);
      return [];
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseDoc, categoriesSnap, reviewsSnap] = await Promise.all([
          getDoc(doc(db, 'courses', id)),
          getDocs(collection(db, 'categories')),
          getDocs(collection(db, 'courses', id, 'reviews')),
        ]);
        const catMap = categoriesSnap.docs.reduce((acc, d) => {
          const data = d.data();
          acc[d.id] = data.title || data.name || d.id;
          return acc;
        }, {});
        setCategoriesMap(catMap);

        if (courseDoc.exists()) {
          const raw = courseDoc.data();
          const reviews = reviewsSnap.docs.map((d) => d.data()).filter(Boolean);
          const categoryId = raw.categoryId || raw.category;
          const courseData = {
            id: courseDoc.id,
            ...raw,
            categoryId,
            category: catMap[categoryId] || raw.category || 'Course',
            rating: computeAverageRating(reviews),
            reviewsCount: reviews.length,
          };
          setCourse(courseData);

          if (courseData.teacherId) {
            const teacherDoc = await getDoc(doc(db, 'teachers', courseData.teacherId));
            if (teacherDoc.exists()) {
              setTeacher({ id: teacherDoc.id, ...teacherDoc.data() });
            }
          }
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  useEffect(() => {
    const fetchRatingsForCart = async () => {
      if (cartCoursesFromState.length === 0) {
        setEnrichedCartCourses([]);
        return;
      }

      const updated = await Promise.all(
        cartCoursesFromState.map(async (item) => {
          if (item?.rating != null) return item;
          if (!item?.id) return item;

          try {
            const snap = await getDoc(doc(db, 'courses', item.id));
            if (snap.exists()) {
              const data = snap.data();
              const reviews = await fetchCourseReviews(item.id);
              const categoryId = data.categoryId || data.category;
              return {
                ...item,
                ...data,
                id: snap.id,
                categoryId,
                category: categoriesMap[categoryId] || data.category || 'Course',
                rating: computeAverageRating(reviews),
                reviewsCount: reviews.length,
              };
            }
          } catch (err) {
            console.error('Failed to fetch rating for cart item', item.id, err);
          }
          return item;
        })
      );

      setEnrichedCartCourses(updated);
    };

    fetchRatingsForCart();
  }, [cartCoursesFromState]);

  const checkoutItems =
    enrichedCartCourses.length > 0 ? enrichedCartCourses : course ? [course] : [];

  const totalAmount = checkoutItems.reduce((sum, item) => {
    const price = typeof item?.price === 'number' ? item.price : parseFloat(item?.price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const safeAmount = Number.isFinite(totalAmount) && totalAmount > 0
    ? Number(totalAmount.toFixed(2))
    : 1;

  const normalizeReviews = (reviews) => {
    if (Array.isArray(reviews)) return reviews;
    if (reviews && typeof reviews === 'object') return Object.values(reviews);
    return [];
  };

  const computeAverageRating = (reviews = []) => {
    const nums = reviews
      .map((r) => (typeof r?.rating === 'number' ? r.rating : parseFloat(r?.rating)))
      .filter((n) => !Number.isNaN(n));
    if (!nums.length) return 0;
    const sum = nums.reduce((acc, n) => acc + n, 0);
    return Number((sum / nums.length).toFixed(1));
  };

  const displayItems = checkoutItems.map((item) => {
    const reviews = normalizeReviews(item.reviews);
    const rating = item.rating != null ? item.rating : computeAverageRating(reviews);
    return {
      ...item,
      rating,
      reviewsCount: item.reviewsCount ?? reviews.length,
    };
  });

  const handlePaymentSuccess = async (details) => {
    console.log('Payment successful:', details);
    setPaymentError(null);

    try {
      await addDoc(collection(db, 'payments'), {
        paymentId: details.id,
        payer: details?.payer || null,
        amount: totalAmount,
        currency: details?.purchase_units?.[0]?.amount?.currency_code || 'USD',
        status: details?.status || 'COMPLETED',
        method: paymentMethod || 'paypal',
        courses: checkoutItems.map((item) => ({
          id: item.id,
          title: item.title,
          rating: item.reviews?.rating ?? null,
          price: item.price,
          category: item.category || null,
        })),
        studentId: uid || null,
        studentEmail: profile?.email || null,
        createdAt: serverTimestamp(),
      });

      if (uid) {
        const enrollmentsRef = collection(db, 'users', uid, 'enrollments');
        await Promise.all(
          checkoutItems.map((item) =>
            setDoc(
              doc(enrollmentsRef, item.id),
              {
                courseId: item.id,
                purchasedAt: serverTimestamp(),
                price: item.price ?? null,
                status: 'active',
                title: item.title ?? '',
                category: item.category ?? '',
              },
              { merge: true }
            )
          )
        );
      }
    } catch (logErr) {
      console.error('Failed to log payment to Firestore:', logErr);
    }

    navigate('/payment-success', {
      state: {
        courses: checkoutItems,
        paymentId: details.id,
        amount: totalAmount,
      },
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    const message = error?.message || 'Payment failed. Please try again or choose another method.';
    setPaymentError(message);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading course details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <CheckoutStepper currentStep={currentStep} className="justify-center mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-1 lg:order-2 lg:ml-8">
            <OrderSummaryCard items={displayItems} teacher={teacher} totalAmount={totalAmount} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 order-2 lg:order-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Payment Method</h2>

            {paymentError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Payment couldn’t be completed</p>
                    <p>{paymentError}</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4 mb-6">
                <div
                  onClick={() => {
                    setPaymentMethod('paypal');
                    setCurrentStep(2);
                  }}
                  className={`group p-5 border-2 rounded-3xl cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                    paymentMethod === 'paypal'
                      ? 'border-teal-600 shadow-[0_8px_24px_rgba(13,148,136,0.15)] bg-white'
                      : 'border-gray-200 hover:border-teal-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        paymentMethod === 'paypal' ? 'border-teal-600 bg-teal-50' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">PayPal</div>
                      <div className="text-base text-gray-500">Pay with PayPal</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50">
                    <img
                      src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                      alt="PayPal"
                      className="w-8 h-8"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="mb-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-gray-600 text-sm">
                    Selected payment method:
                    {paymentMethod === 'paypal' && ' PayPal'}
                    {paymentMethod === 'bank' && ' Bank Transfer'}
                  </p>
                </div>

                {paymentMethod === 'paypal' && (
                  <div>
                    <PayPalButton
                      amount={safeAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                    {paymentError && (
                      <p className="text-red-600 text-sm mt-3">{paymentError}</p>
                    )}
                    {safeAmount !== totalAmount && (
                      <p className="text-amber-600 text-xs mt-2">
                        Using minimum charge amount because course price is missing.
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-teal-600 text-sm hover:text-teal-700 font-medium"
                    >
                      ← Back to Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="inline-flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your payment information is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
