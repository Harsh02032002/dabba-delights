import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 36, text: 'text-3xl' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="gradient-primary p-2 rounded-xl shadow-lg">
          <UtensilsCrossed size={sizes[size].icon} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-display font-bold text-foreground leading-tight', sizes[size].text)}>
            Dabba
          </span>
          <span className={cn('font-display font-bold text-primary leading-tight -mt-1', sizes[size].text)}>
            Nation
          </span>
        </div>
      )}
    </div>
  );
}
