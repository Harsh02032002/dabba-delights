import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : 'http://localhost:5000');

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    // Seller events
    socket.on('newOrder', () => {
      toast({ title: '🔔 New Order!', description: 'You have a new order to review.' });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
    });

    socket.on('settlementProcessed', () => {
      toast({ title: '💰 Settlement Processed', description: 'Your payout has been settled.' });
      queryClient.invalidateQueries({ queryKey: ['seller-settlements'] });
    });

    socket.on('kycApproved', () => {
      toast({ title: '✅ KYC Approved', description: 'Your KYC verification is complete!' });
      queryClient.invalidateQueries({ queryKey: ['seller-kyc'] });
    });

    socket.on('lowStockAlert', (data: any) => {
      toast({ title: '⚠️ Low Stock Alert', description: `${data?.productName || 'A product'} is running low on stock.`, variant: 'destructive' });
    });

    // User events
    socket.on('orderUpdate', (data: any) => {
      toast({ title: '📦 Order Update', description: data?.message || 'Your order status has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    });

    socket.on('cartUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
    });

    socket.on('walletUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
    });

    socket.on('newNotification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Admin events
    socket.on('newDispute', () => {
      toast({ title: '🚨 New Dispute', description: 'A new dispute has been filed.' });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
    });

    socket.on('newSellerSignup', () => {
      toast({ title: '🏪 New Seller Signup', description: 'A new seller has registered.' });
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    });

    socket.on('menuUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['seller-menu'] });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
