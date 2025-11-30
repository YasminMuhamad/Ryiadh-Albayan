import React from 'react';

export default function OrderSummaryCard({ items = [], teacher, totalAmount }) {
  const renderStars = (rating = 0) => {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half)"
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
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 w-full">
            <img
              src={item.thumbnail || item.image || '/api/placeholder/80/80'}
              alt={item.title}
              className="w-16 h-16 rounded-lg object-cover mr-3"
              onError={(e) => {
                e.target.src = '/api/placeholder/80/80';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-snug break-words">{item.title}</p>
              <p className="text-xs text-gray-600 break-words">{item.category}</p>
              <div className="mt-1 flex items-center gap-2">
                {renderStars(item.rating)}
                <span className="text-xs text-gray-600">{Number(item.rating) ? Number(item.rating).toFixed(1) : '0.0'}</span>
              </div>
            </div>
            <span className="ml-2 font-semibold text-sm whitespace-nowrap">
              ${typeof item.price === 'number' ? item.price : item.price || 0}
            </span>
          </div>
        ))}
        {teacher && items.length === 1 && <p className="text-sm text-teal-600">Instructor: {teacher.name}</p>}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Course Price:</span>
          <span className="font-semibold">${totalAmount}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total:</span>
          <span className="text-teal-600">${totalAmount}</span>
        </div>
      </div>
    </div>
  );
}
