import { cn } from '@/lib/utils';
import { SellerType } from '@/types';
import { Home, Store } from 'lucide-react';

interface SellerBadgeProps {
  type: SellerType;
  className?: string;
}

export function SellerBadge({ type, className }: SellerBadgeProps) {
  const isHomeChef = type === 'home_chef';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        isHomeChef ? 'badge-home-cooked' : 'badge-restaurant',
        className
      )}
    >
      {isHomeChef ? (
        <>
          <Home size={12} />
          <span>Home-Cooked</span>
        </>
      ) : (
        <>
          <Store size={12} />
          <span>Restaurant</span>
        </>
      )}
    </div>
  );
}

interface VegBadgeProps {
  isVeg: boolean;
  className?: string;
}

export function VegBadge({ isVeg, className }: VegBadgeProps) {
  return (
    <div
      className={cn(
        'w-5 h-5 border-2 rounded flex items-center justify-center',
        isVeg ? 'border-green-600' : 'border-red-600',
        className
      )}
    >
      <div
        className={cn(
          'w-2.5 h-2.5 rounded-full',
          isVeg ? 'bg-green-600' : 'bg-red-600'
        )}
      />
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-info/10 text-info',
    preparing: 'bg-primary/10 text-primary',
    ready: 'bg-accent/10 text-accent',
    out_for_delivery: 'bg-info/10 text-info',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
    active: 'bg-success/10 text-success',
    paused: 'bg-warning/10 text-warning',
    expired: 'bg-muted text-muted-foreground',
    verified: 'bg-success/10 text-success',
    submitted: 'bg-info/10 text-info',
    rejected: 'bg-destructive/10 text-destructive',
  };

  const displayStatus = status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize',
        statusStyles[status] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {displayStatus}
    </span>
  );
}
