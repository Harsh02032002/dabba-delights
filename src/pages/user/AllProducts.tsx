import { useState } from 'react';
import { UserLayout } from '@/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { Search, ArrowLeft, Clock, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VegBadge } from '@/components/shared/Badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { safeArray } from '@/utils/safeArray';

export default function AllProducts() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set());

  const { data: response, isLoading } = useQuery({
    queryKey: ['all-products', search, category, vegOnly, sortBy, page],
    queryFn: () =>
      userAPI.getMenuItems({
        search: search || undefined,
        category: category === 'all' ? undefined : category,
        isVeg: vegOnly || undefined,
        sortBy,
        page,
        limit: 20,
      }),
    placeholderData: (previousData) => previousData,
  });

  // Bulletproof: extract array no matter what shape response is
  const items = Array.isArray((response as any)?.products) ? (response as any).products : Array.isArray((response as any)?.data) ? (response as any).data : Array.isArray(response) ? response as any[] : [];

  const totalItems = (response as any)?.total || items.length;
  const totalPages = Math.ceil(totalItems / 20);

  const handleAddToCart = (item: any) => {
    const seller = item.sellerId || { _id: item.sellerId?._id || item.sellerId, businessName: item.sellerId?.businessName || 'Unknown' };
    addToCart(item, seller._id, seller.businessName, seller.type || 'home_chef');
    toast({ title: 'Added to cart', description: `${item.name} added to your cart` });
  };

  const handleWishlist = async (item: any) => {
    try {
      if (wishlistedItems.has(item._id)) {
        await userAPI.removeFromWishlist(item._id);
        setWishlistedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item._id);
          return newSet;
        });
        toast({ title: 'Removed from wishlist' });
      } else {
        await userAPI.addToWishlist(item._id);
        setWishlistedItems(prev => new Set(prev).add(item._id));
        toast({ title: 'Added to wishlist' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update wishlist', variant: 'destructive' });
    }
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-display font-bold text-foreground">
            All Products
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="indian">Indian</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              id="veg-only"
              checked={vegOnly}
              onCheckedChange={setVegOnly}
            />
            <Label htmlFor="veg-only">Veg Only</Label>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item: any) => (
                <div key={item._id} className="food-card overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWishlist(item);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          wishlistedItems.has(item._id)
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-card/80 text-muted-foreground hover:text-destructive"
                        }`}
                      >
                        <Heart size={16} className={wishlistedItems.has(item._id) ? "fill-current" : ""} />
                      </button>
                    </div>
                    {item.isVeg && (
                      <VegBadge 
                        isVeg={true} 
                        className="absolute top-3 left-3" 
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                      {item.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-foreground">
                          ₹{item.discountPrice || item.price || 0}
                        </span>
                        {item.discountPrice && item.price && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ₹{item.price}
                          </span>
                        )}
                      </div>

                      <Button 
                        size="sm" 
                        variant="gradient" 
                        className="h-9 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                      >
                        <Plus size={16} /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>

                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}