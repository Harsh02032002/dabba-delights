import { useState } from 'react';
import { Home, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SellerType } from '@/types';

interface FoodToggleProps {
  value: SellerType | 'all';
  onChange: (value: SellerType | 'all') => void;
}

export function FoodToggle({ value, onChange }: FoodToggleProps) {
  return (
    <div className="inline-flex bg-secondary rounded-2xl p-1.5 shadow-inner">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={cn(
          'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
          value === 'all'
            ? 'bg-card text-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        All Food
      </button>
      <button
        type="button"
        onClick={() => onChange('home_chef')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
          value === 'home_chef'
            ? 'bg-success text-success-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Home size={16} />
        Home-Cooked
      </button>
      <button
        type="button"
        onClick={() => onChange('restaurant')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
          value === 'restaurant'
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Store size={16} />
        Restaurants
      </button>
    </div>
  );
}
