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
import { Search, ArrowLeft, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VegBadge } from '@/components/shared/Badge';
import { safeArray } from '@/utils/safeArray';

export default function AllProducts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['all-products', search, category, vegOnly, sortBy, page],
    queryFn: async () => {
      const res = await userAPI.getMenuItems({
        search: search || undefined,
        category: category === 'all' ? undefined : category,
        isVeg: vegOnly || undefined,
        sortBy,
        page,
        limit: 20,
      });
      return res;
    },
    placeholderData: (previousData) => previousData,
  });

  // Extract items safely
  const items = safeArray(
    response?.products ||
    response?.data ||
    response?.data?.products ||
    []
  );

  const totalItems = response?.total || items.length;
  const totalPages = Math.ceil(totalItems / 20);

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

                      <Button size="sm" variant="gradient" className="h-9 px-4">
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