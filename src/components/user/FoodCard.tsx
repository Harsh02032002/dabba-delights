import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, SellerProfile, SellerType } from '@/types';
import { SellerBadge, VegBadge } from '@/components/shared/Badge';
import { RatingStars } from '@/components/shared/RatingStars';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Clock, Plus, MapPin, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodCardProps {
  item: MenuItem;
  seller: SellerProfile;
  className?: string;
}

export function FoodCard({ item, seller, className }: FoodCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, seller._id, seller.businessName, seller.type);
  };

  return (
    <div
      className={cn('food-card overflow-hidden cursor-pointer group', className)}
      onClick={() => navigate(`/seller/${seller._id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <SellerBadge type={seller.type} />
        </div>
        <div className="absolute top-3 right-3">
          <VegBadge isVeg={item.isVeg} />
        </div>
        {item.discountPrice && (
          <div className="absolute bottom-3 left-3 bg-success text-success-foreground px-2 py-1 rounded-lg text-xs font-bold">
            {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
            <Clock size={14} />
            <span>{item.preparationTime}m</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        
        <div className="flex items-center gap-2 mb-3">
          <RatingStars rating={seller.rating} size="sm" />
          <span className="text-xs text-muted-foreground">
            {seller.totalOrders.toLocaleString()} orders
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              ₹{item.discountPrice || item.price}
            </span>
            {item.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{item.price}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="gradient"
            onClick={handleAddToCart}
            className="h-9 px-4"
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SellerCardProps {
  seller: SellerProfile;
  className?: string;
}

export function SellerCard({ seller, className }: SellerCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn('food-card overflow-hidden cursor-pointer group', className)}
      onClick={() => navigate(`/seller/${seller._id}`)}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={seller.coverImage}
          alt={seller.businessName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <SellerBadge type={seller.type} />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <img
            src={seller.logo}
            alt={seller.businessName}
            className="w-12 h-12 rounded-xl object-cover shadow-md -mt-8 border-2 border-card"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1">{seller.businessName}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {seller.cuisines.join(' • ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <RatingStars rating={seller.rating} size="sm" />
            <span className="text-sm font-medium">{seller.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span className="line-clamp-1">{seller.address.city}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {seller.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
