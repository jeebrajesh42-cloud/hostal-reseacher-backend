import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({ rating = 0, reviewCount = null, size = 'md', interactive = false, onRatingChange = null }) => {
  const stars = [1, 2, 3, 4, 5];
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rating ${rating} out of 5 stars`}>
      <div className="flex items-center text-amber-400">
        {stars.map((star) => {
          const filled = rating >= star;
          const half = rating >= star - 0.5 && rating < star;

          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
            >
              <Star
                className={`${starSizes[size]} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : half
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="font-semibold text-secondary-900 text-sm">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== null && (
        <span className="text-secondary-500 text-xs">
          ({reviewCount} reviews)
        </span>
      )}
    </div>
  );
};

export default Rating;
