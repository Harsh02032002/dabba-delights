import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RatingStars } from '@/components/shared/RatingStars';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Star, MessageCircle, Send } from 'lucide-react';

export default function SellerReviews() {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['seller-reviews'],
    queryFn: () => sellerAPI.getReviews(),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => sellerAPI.replyToReview(id, message),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['seller-reviews'] });
      toast({ title: 'Reply sent!' });
      setReplyText(prev => ({ ...prev, [id]: '' }));
    },
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <SellerLayout title="Reviews & Ratings" subtitle="See what customers say about your food">
      {/* Average Rating */}
      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <p className="text-5xl font-bold text-foreground mb-2">{avgRating}</p>
          <RatingStars rating={Number(avgRating)} size="lg" />
          <p className="text-muted-foreground mt-2">{reviews.length} reviews</p>
        </CardContent>
      </Card>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {review.customerName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{review.customerName || 'Customer'}</p>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={review.rating} size="sm" />
                          <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground mb-3">{review.comment}</p>

                    {review.reply ? (
                      <div className="bg-secondary/50 rounded-xl p-3 mt-2">
                        <p className="text-sm font-medium text-foreground mb-1">Your reply:</p>
                        <p className="text-sm text-muted-foreground">{review.reply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText[review._id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [review._id]: e.target.value }))}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          variant="gradient"
                          size="icon"
                          className="shrink-0 self-end"
                          disabled={!replyText[review._id]?.trim() || replyMutation.isPending}
                          onClick={() => replyMutation.mutate({ id: review._id, message: replyText[review._id] })}
                        >
                          <Send size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {reviews.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No reviews yet</p></div>}
        </div>
      )}
    </SellerLayout>
  );
}
