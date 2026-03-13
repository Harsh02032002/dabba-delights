import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { userAPI } from '@/lib/api';

interface UserRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  sellerName: string;
  onRatingSubmit?: () => void;
}

export function UserRatingModal({ 
  isOpen, 
  onClose, 
  orderId, 
  sellerName,
  onRatingSubmit 
}: UserRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Select at least 1 star to rate",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await userAPI.rateOrder(orderId, rating, review);
      toast({
        title: "Thank you for rating!",
        description: `You rated ${sellerName} ${rating} stars`,
      });
      onClose();
      onRatingSubmit?.();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Rate your order</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="text-center mb-6">
          <p className="text-muted-foreground mb-4">How was your experience with {sellerName}?</p>
          
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 1;
              const isFilled = starValue <= rating;
              const isHovered = starValue <= hovered;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHovered(starValue)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    size={32}
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

          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Textarea
            placeholder="Share your experience (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Rating
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
