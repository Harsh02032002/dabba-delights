import { useCallback } from 'react';
import { queryClient } from '@/App';
import { userAPI, sellerAPI, productAPI } from '@/lib/api';

/**
 * Hook for prefetching data to improve perceived performance
 * Use this to preload data on hover or when idle
 */
export function usePrefetch() {
  // Prefetch user data (sellers, products)
  const prefetchUserHome = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['sellers'],
      queryFn: () => userAPI.getSellers(),
      staleTime: 30 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: () => productAPI.getProducts(),
      staleTime: 30 * 1000,
    });
  }, []);

  // Prefetch seller dashboard data
  const prefetchSellerDashboard = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['seller-dashboard'],
      queryFn: () => sellerAPI.getDashboard(),
      staleTime: 30 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: ['seller-orders'],
      queryFn: () => sellerAPI.getOrders(),
      staleTime: 30 * 1000,
    });
  }, []);

  // Prefetch specific seller profile
  const prefetchSellerProfile = useCallback((sellerId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['seller', sellerId],
      queryFn: () => userAPI.getMenuItems({ sellerId }),
      staleTime: 60 * 1000,
    });
  }, []);

  // Prefetch user cart and wishlist
  const prefetchUserData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['cart'],
      queryFn: () => userAPI.getCart(),
      staleTime: 30 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: ['wishlist'],
      queryFn: () => userAPI.getWishlist(),
      staleTime: 60 * 1000,
    });
  }, []);

  // Idle prefetch - prefetch when browser is idle
  const prefetchOnIdle = useCallback((callback: () => void) => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback, { timeout: 2000 });
    } else {
      // Fallback for Safari
      setTimeout(callback, 1);
    }
  }, []);

  return {
    prefetchUserHome,
    prefetchSellerDashboard,
    prefetchSellerProfile,
    prefetchUserData,
    prefetchOnIdle,
  };
}
