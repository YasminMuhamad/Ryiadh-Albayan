import React from 'react';

export default function PaymentSteps({ currentStep = 1 }) {
  const steps = [
    { id: 1, name: 'Course Selection', completed: currentStep > 1 },
    { id: 2, name: 'Payment Details', completed: currentStep > 2 },
    { id: 3, name: 'Confirmation', completed: currentStep > 3 }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
              ${step.completed 
                ? 'bg-teal-600 border-teal-600 text-white' 
                : currentStep === step.id
                ? 'border-teal-600 text-teal-600'
                : 'border-gray-300 text-gray-500'
              }
            `}>
              {step.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              step.completed || currentStep === step.id ? 'text-teal-600' : 'text-gray-500'
            }`}>
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              step.completed ? 'bg-teal-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
