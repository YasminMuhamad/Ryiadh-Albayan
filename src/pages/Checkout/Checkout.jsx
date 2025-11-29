import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import PayPalButton from '../../components/PayPalButton';
import CheckoutStepper from '../../components/CheckoutStepper';
import OrderSummaryCard from '../../components/OrderSummaryCard';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCoursesFromState = useMemo(() => location.state?.cartCourses || [], [location.state]);
  const [enrichedCartCourses, setEnrichedCartCourses] = useState(cartCoursesFromState);
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course details
        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (courseDoc.exists()) {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };
          setCourse(courseData);

          // Fetch teacher details
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

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // Ensure ratings for cart items come from Firestore when missing
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
              return { ...item, ...data, id: snap.id };
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

  const checkoutItems = enrichedCartCourses.length > 0
    ? enrichedCartCourses
    : course
      ? [course]
      : [];

  const totalAmount = checkoutItems.reduce((sum, item) => {
    const price = typeof item?.price === 'number' ? item.price : parseFloat(item?.price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const handlePaymentSuccess = async (details) => {
    console.log('Payment successful:', details);
    setPaymentError(null);

    try {
      await addDoc(collection(db, 'payment'), {
        paymentId: details.id,
        payer: details?.payer || null,
        amount: totalAmount,
        currency: details?.purchase_units?.[0]?.amount?.currency_code || 'USD',
        status: details?.status || 'COMPLETED',
        method: paymentMethod || 'paypal',
        courses: checkoutItems.map((item) => ({
          id: item.id,
          title: item.title,
          rating: item.rating ?? null,
          price: item.price,
          category: item.category || null,
        })),
        createdAt: serverTimestamp(),
      });
    } catch (logErr) {
      console.error('Failed to log payment to Firestore:', logErr);
    }

    navigate('/payment-success', { 
      state: { 
        courses: checkoutItems,
        paymentId: details.id,
        amount: totalAmount
      }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        </div>

        {/* Steps Progress */}
        <CheckoutStepper currentStep={currentStep} className="justify-center mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Summary */}
          <div className="order-1 lg:order-2 lg:ml-8">
            <OrderSummaryCard items={checkoutItems} teacher={teacher} totalAmount={totalAmount} />
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 order-2 lg:order-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Payment Method</h2>

            {paymentError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <div>
                    <p className="font-semibold">Payment couldn’t be completed</p>
                    <p>{paymentError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Payment Options - Only show in step 1 */}
            {currentStep === 1 && (
            <div className="space-y-4 mb-6">
              {/* PayPal Option */}
              <div 
                onClick={() => {
                  setPaymentMethod('paypal');
                  setCurrentStep(2);
                }}
                className={`p-5 border-2 rounded-2xl cursor-pointer transition-colors ${
                  paymentMethod === 'paypal' ? 'border-teal-600 bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-4 ${
                      paymentMethod === 'paypal' ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'paypal' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 mb-1">PayPal</div>
                      <div className="text-sm text-gray-500">Pay with PayPal</div>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.73-.258c-.31-.075-.663-.14-1.074-.14H15.19c-.524 0-.968.382-1.05.9l-.72 4.571-.84 5.334h4.606c2.57 0 4.578-.543 5.69-1.81 1.01-1.15 1.304-2.42 1.012-4.287-.023-.143-.047-.288-.077-.437-.455-2.334-1.315-3.873-2.639-4.873z"/>
                    </svg>
                  </div>
                </div>
              </div>




            </div>
            )}

            {/* Step 2: Payment Form */}
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
                      amount={totalAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-6 text-center">
                    <div className="p-4 bg-teal-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-teal-800 mb-3">Bank Transfer</h4>
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <p className="text-gray-700 font-medium mb-2">Transfer Details:</p>
                      <p className="text-gray-600 text-sm">Account Number: 1234567890</p>
                      <p className="text-gray-600 text-sm">Bank Name: National Bank</p>
                      <p className="text-gray-600 text-sm">Beneficiary: Riyadh Al-Bayan</p>
                    </div>
                    <p className="text-teal-700 text-sm mb-4">Please send transfer receipt via WhatsApp</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 bg-white border border-teal-600 text-teal-600 py-3 rounded-2xl font-semibold hover:bg-teal-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => {
                          handlePaymentSuccess({ id: 'bank_transfer', status: 'pending' });
                          setCurrentStep(3);
                        }}
                        className="flex-1 bg-teal-600 text-white py-3 rounded-2xl font-semibold hover:bg-teal-700 transition-colors"
                      >
                        Complete Payment
                      </button>
                    </div>
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

        {/* Security Notice */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Your payment information is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
