import { cn } from '@/lib/utils';
import { LucideIcon, Package, Search, ShoppingCart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="gradient">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet. Browse our delicious menu to get started!"
      action={onBrowse ? { label: 'Browse Menu', onClick: onBrowse } : undefined}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={FileText}
      title="No orders yet"
      description="You haven't placed any orders yet. Start exploring and order your favorite meals!"
    />
  );
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
    />
  );
}
