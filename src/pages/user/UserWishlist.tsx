import { UserLayout } from '@/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, getImageUrl } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VegBadge } from '@/components/shared/Badge';
import { useCart } from '@/contexts/CartContext';

export default function UserWishlist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: async () => {
      const res = await userAPI.getWishlist();
      return res?.data || res || [];
    },
    placeholderData: (prev) => prev,
  });

  const wishlist = Array.isArray(data) ? data : [];

  const removeMutation = useMutation({
    mutationFn: (productId: string) =>
      userAPI.addToWishlist(productId), // toggle remove
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
      toast({ title: 'Removed from wishlist' });
    },
    onError: (err: any) =>
      toast({
        title: 'Error',
        description: err?.message || 'Something went wrong',
        variant: 'destructive',
      }),
  });

  const { addToCart } = useCart();
  const handleAddToCart = (item: any) => {
    const seller = item?.sellerId;
    const sellerId = typeof seller === 'object' ? seller?._id : seller;
    addToCart(item, String(sellerId || ''), seller?.businessName || 'Restaurant', seller?.type || 'home_chef');
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>

          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlist.length} items saved
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading wishlist..." />
        ) : wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-4">
              Save your favorite dishes here
            </p>
            <Button
              variant="gradient"
              onClick={() => navigate('/')}
            >
              Browse Food
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item: any) => (
              <div
                key={item?._id}
                className="food-card overflow-hidden group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getImageUrl(item?.image)}
                    alt={item?.name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-3 right-3">
                    <VegBadge isVeg={item?.isVeg} />
                  </div>

                  <button
                    onClick={() =>
                      removeMutation.mutate(item?._id)
                    }
                    disabled={removeMutation.isPending}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                    {item?.name}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item?.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">
                      ₹{item?.discountPrice || item?.price || 0}
                    </span>

                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => handleAddToCart(item)}
                      className="gap-1"
                    >
                      <ShoppingCart size={14} /> Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}