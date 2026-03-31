import { ReactNode, useState, useEffect } from 'react';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface SellerLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

interface Notification {
  id: number;
  type: 'new_order' | 'status_update' | 'delivery_update';
  title: string;
  message: string;
  order?: any;
  orderId?: string;
  timestamp: Date;
  actions?: { label: string; action: string; variant: string }[];
}

export function SellerLayout({ children, title, subtitle, headerActions }: SellerLayoutProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  // Load persisted notifications on mount
  useEffect(() => {
    const saved = localStorage.getItem('seller_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
        setUnreadCount(parsed.length);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Persist notifications when they change
  useEffect(() => {
    localStorage.setItem('seller_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.length);
  }, [notifications]);

  // Order Management Functions
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await sellerAPI.updateOrderStatus(orderId, 'confirmed');
      toast({ title: "✅ Order Accepted", description: "Order confirmed and delivery partner notified" });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setNotifications(prev => prev.filter(n => !n.order || n.order.orderId !== orderId));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await sellerAPI.updateOrderStatus(orderId, 'cancelled');
      toast({ title: "❌ Order Rejected", description: "Order has been cancelled" });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setNotifications(prev => prev.filter(n => !n.order || n.order.orderId !== orderId));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Socket.io connection for real-time order updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      console.log('Seller connected to socket');
      socket.emit('join_seller_room');
    });

    socket.on('new_order', (order: any) => {
      console.log('🍔 New order received:', order);
      
      const newNotification: Notification = {
        id: Date.now(),
        type: 'new_order',
        title: '🍔 New Order Received',
        message: `Order #${order.orderNumber} - ₹${order.totalAmount}`,
        order,
        timestamp: new Date(),
        actions: [
          { label: 'Accept', action: 'accept', variant: 'default' },
          { label: 'Reject', action: 'reject', variant: 'destructive' }
        ]
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      
      toast({ 
        title: "🍔 New Order Received!", 
        description: `Order #${order.orderNumber} - ₹${order.totalAmount}`,
        action: (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleAcceptOrder(order.orderId)}>
              Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleRejectOrder(order.orderId)}>
              Reject
            </Button>
          </div>
        )
      });
      
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    });

    socket.on('order_status_update', (data: any) => {
      console.log('📦 Order status update:', data);
      
      setNotifications(prev => [{
        id: Date.now(),
        type: 'status_update',
        title: '📦 Order Status Update',
        message: data.message,
        orderId: data.orderId,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
      
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    });

    socket.on('delivery_status_update', (data: any) => {
      console.log('🛵 Delivery status update:', data);
      
      setNotifications(prev => [{
        id: Date.now(),
        type: 'delivery_update',
        title: '🛵 Delivery Update',
        message: data.message,
        orderId: data.orderId,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
      
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <div className="w-2 h-2 rounded-full bg-green-500 mt-1" />;
      case 'delivery_update':
        return <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500 mt-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />
      
      <div className="lg:ml-[260px] transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-effect border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 bg-secondary border-transparent h-9"
                />
              </div>
              
              {headerActions && (
                <div className="flex items-center">
                  {headerActions}
                </div>
              )}
              
              {/* Notifications Bell */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-white text-xs rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        {notifications.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllNotifications}
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">{notification.title}</p>
                                  <p className="text-sm text-gray-600">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                  </p>
                                  
                                  {notification.type === 'new_order' && notification.actions && (
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          handleAcceptOrder(notification.order?.orderId);
                                          removeNotification(notification.id);
                                        }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          handleRejectOrder(notification.order?.orderId);
                                          removeNotification(notification.id);
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-600 shrink-0"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
