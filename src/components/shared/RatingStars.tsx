import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) {
  const sizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const halfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={cn(
                'transition-colors',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
            >
              <Star
                size={sizes[size]}
                className={cn(
                  filled || halfFilled ? 'fill-warning text-warning' : 'text-muted-foreground/30',
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
