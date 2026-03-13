import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { userAPI } from '@/lib/api';

interface ProductRatingProps {
  productId: string;
  currentRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function ProductRating({ 
  productId, 
  currentRating = 0, 
  size = 'md',
  showCount = true,
  className 
}: ProductRatingProps) {
  const [rating, setRating] = useState(currentRating);
  const [hovered, setHovered] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleRate = async (newRating: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, you'd get the order ID that contains this product
      // For now, we'll just show a toast
      toast({
        title: "Feature Coming Soon",
        description: "Product rating will be available after order delivery.",
      });
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
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(0)}
              disabled={isSubmitting}
              className="transition-all hover:scale-110 disabled:cursor-not-allowed"
            >
              <Star
                size={sizes[size]}
                className={`${
                  isFilled || isHovered
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground/30'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
