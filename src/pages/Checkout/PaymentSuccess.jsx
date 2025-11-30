import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutStepper from '../../components/CheckoutStepper';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courses = [], paymentId, amount } = location.state || {};

  const primaryCourse = courses.length > 0 ? courses[0] : null;
  const formattedAmount = amount ? `$${Number(amount).toFixed(2)}` : '—';
  const courseTitle = primaryCourse?.title || 'Your course is ready';
  const courseCategory = primaryCourse?.category || 'Course Library';
  const referenceId = paymentId || 'Available in your email receipt';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 py-14 px-4 flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <CheckoutStepper currentStep={3} className="max-w-3xl mx-auto mb-10" />

        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Left column */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">Payment confirmed</p>
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">Payment completed successfully!</h1>
                  <p className="text-gray-600 mt-1">You're now enrolled. Start learning right away.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">Course unlocked</p>
                <p className="text-2xl font-bold mb-1">{courseTitle}</p>
                <p className="text-teal-50">{courseCategory}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-emerald-50">
                  <span className="px-3 py-1 rounded-full bg-white/15">Lifetime access</span>
                  <span className="px-3 py-1 rounded-full bg-white/15">Immediate start</span>
                  <span className="px-3 py-1 rounded-full bg-white/15">Expert support</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase">Amount paid</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{formattedAmount}</p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase">Reference</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{referenceId}</p>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="text-sm font-medium text-emerald-600 mt-1">Confirmed</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() =>
                    navigate(primaryCourse?.id ? `/courses/${primaryCourse.id}` : '/courses', {
                      state: { fromPaymentSuccess: true },
                    })
                  }
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors shadow-md"
                >
                  Go to my course
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="flex-1 border border-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Explore more courses
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 w-full">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Success</span>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Course</span>
                    <span className="font-medium text-gray-900 truncate max-w-[55%] text-right">
                      {courses.length > 1 ? `${courses.length} courses` : courseTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category</span>
                    <span className="font-medium text-gray-900">{courseCategory}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Paid today</span>
                    <span className="text-lg font-bold text-emerald-600">{formattedAmount}</span>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-white p-4 border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Need assistance?</h4>
                  <p className="text-sm text-gray-600 mb-3">Our team is on standby if you have any questions about your payment or course access.</p>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full text-center text-sm font-semibold text-teal-700 hover:text-teal-800"
                  >
                    Contact support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
