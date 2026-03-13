import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { userAPI } from '@/lib/api';

interface InteractiveRatingProps {
  itemId: string;
  itemType: 'menu' | 'seller';
  currentRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function InteractiveRating({ 
  itemId, 
  itemType,
  currentRating = 0, 
  size = 'md',
  showValue = true,
  className 
}: InteractiveRatingProps) {
  const [rating, setRating] = useState(currentRating);
  const [hovered, setHovered] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleRating = async (newRating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (itemType === 'menu') {
        // For menu items, save rating directly to menu
        await userAPI.rateMenuItem(itemId, newRating);
        setRating(newRating);
        toast({
          title: "Menu Rated!",
          description: `You rated this item ${newRating} stars`,
        });
      } else if (itemType === 'seller') {
        // For sellers, save rating directly to seller
        await userAPI.rateSeller(itemId, newRating);
        setRating(newRating);
        toast({
          title: "Seller Rated!",
          description: `You rated this seller ${newRating} stars`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isHovered = starValue <= hovered;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleRating(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(0)}
              disabled={isSubmitting}
              className="transition-all hover:scale-110 disabled:cursor-not-allowed"
              title={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <Star
                size={sizes[size]}
                className={`${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400' // Yellow filled stars
                    : 'text-gray-300' // Gray empty stars
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {rating > 0 ? `${rating.toFixed(1)}` : 'Not rated'}
        </span>
      )}
    </div>
  );
}
