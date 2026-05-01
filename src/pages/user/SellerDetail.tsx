import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserLayout } from '@/layouts/UserLayout';
import { FoodCard } from '@/components/user/FoodCard';
import { RatingStars } from '@/components/shared/RatingStars';
import { InteractiveRating } from '@/components/user/InteractiveRating';
import { SellerBadge } from '@/components/shared/Badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, MapPin, Clock, Phone } from 'lucide-react';

export default function SellerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller-detail', id],
    queryFn: () => apiRequest(`/user/sellers/${id}`),
    enabled: !!id,
  });

  const { data: menuRes, isLoading: menuLoading } = useQuery({
    queryKey: ['seller-menu', id],
    queryFn: () => apiRequest(`/user/menu?sellerId=${id}`),
    enabled: !!id,
  });

  const sellerData = seller?.seller || seller;
  const menuItems = Array.isArray(menuRes) ? menuRes : menuRes?.products || menuRes?.data || menuRes?.menu || [];

  if (sellerLoading) return <UserLayout><LoadingSpinner /></UserLayout>;
  if (!sellerData) return <UserLayout><div className="text-center py-16"><p className="text-muted-foreground">Seller not found</p><Button variant="ghost" onClick={() => navigate('/home')}>Go Back</Button></div></UserLayout>;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={20} />
        </Button>

        {/* Seller Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <img
            src={sellerData.coverImage || '/placeholder.svg'}
            alt={sellerData.businessName}
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <img
              src={sellerData.logo || '/placeholder.svg'}
              alt={sellerData.businessName}
              className="w-16 h-16 rounded-xl object-cover border-2 border-card shadow-lg"
            />
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold">{sellerData.businessName}</h1>
                <SellerBadge type={sellerData.type} />
              </div>
              <p className="text-white/80 text-sm line-clamp-2">{sellerData.description}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
          <InteractiveRating 
            itemId={sellerData._id} 
            itemType="seller" 
            currentRating={sellerData.rating || 0} 
            size="md" 
          />
          {sellerData.address?.city && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {sellerData.address.city}</span>
          )}

          {(sellerData.cuisines || []).length > 0 && (
            <span>{sellerData.cuisines.join(' • ')}</span>
          )}
        </div>

        {/* Menu */}
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Menu</h2>
        {menuLoading ? <LoadingSpinner /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {menuItems.map((item: any) => (
              <FoodCard key={item._id} item={item} seller={sellerData} />
            ))}
          </div>
        )}
        {!menuLoading && menuItems.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No menu items available</p>
        )}
      </div>
    </UserLayout>
  );
}
