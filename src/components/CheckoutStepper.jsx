import React from 'react';

export default function CheckoutStepper({ currentStep = 1, className = '', steps }) {
  const baseSteps =
    steps ||
    [
      { label: 'Payment Method' },
      { label: 'Payment Info' },
      { label: 'Confirmation' },
    ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {baseSteps.map((step, index) => {
        const stepNumber = index + 1;
        const isDone = currentStep > stepNumber;
        const isCurrent = currentStep === stepNumber;
        const circleClass = isDone || isCurrent ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500';
        const connectorClass = currentStep > stepNumber ? 'bg-emerald-500' : 'bg-gray-200';
        const textClass = isDone || isCurrent ? 'text-gray-900' : 'text-gray-400';

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-3 min-w-[160px]">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-md ${circleClass} ${
                  isCurrent ? 'ring-4 ring-emerald-100' : ''
                }`}
              >
                {isDone ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-lg">{stepNumber}</span>
                )}
              </div>
              <span className={`text-base font-semibold ${textClass}`}>{step.label}</span>
            </div>
            {index < baseSteps.length - 1 && <div className={`flex-1 h-0.5 ${connectorClass}`}></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
