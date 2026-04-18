import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  DollarSign, ShoppingBag, TrendingUp, Star, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, Bell, X, Check, XCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { toast } from '@/hooks/use-toast';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => sellerAPI.getDashboard(),
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  // ─── Order Management Functions (Step 2) ──────
  const handleAcceptOrder = async (orderId: string) => {
    try {
      await sellerAPI.updateOrderStatus(orderId, 'confirmed');
      toast({ title: "✅ Order Accepted", description: "Order confirmed and delivery partner notified" });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
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
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Socket.io connection for real-time order updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    if (socket) {
      socket.on('connect', () => {
        console.log('Seller connected to socket');
        // Join seller room for targeted notifications
        socket.emit('join_seller_room');
      });

      socket.on('new_order', (order: any) => {
        console.log('🍔 New order received:', order);
        
        // Add notification
        setNotifications(prev => [
          { 
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
          },
          ...prev.slice(0, 9) // Keep only last 10 notifications
        ]);
        
        // Show toast
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
        
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      });

      socket.on('order_status_update', (data: any) => {
        console.log('📦 Order status update:', data);
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            type: 'status_update', 
            title: '📦 Order Status Update',
            message: data.message,
            orderId: data.orderId,
            timestamp: new Date()
          },
          ...prev.slice(0, 9)
        ]);
        
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      });

      socket.on('delivery_status_update', (data: any) => {
        console.log('🛵 Delivery status update:', data);
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            type: 'delivery_update', 
            title: '🛵 Delivery Update',
            message: data.message,
            orderId: data.orderId,
            timestamp: new Date()
          },
          ...prev.slice(0, 9)
        ]);
        
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      });

      // ─── Subscription Notifications ──────
      socket.on('new_subscription', (data: any) => {
        console.log('🎯 New subscription received:', data);
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            type: 'subscription', 
            title: '🎯 New Subscription!',
            message: `${data.userName} subscribed with ₹${data.amount} plan`,
            subscriptionId: data.subscriptionId,
            userId: data.userId,
            userName: data.userName,
            userPhone: data.userPhone,
            userAddress: data.userAddress,
            amount: data.amount,
            days: data.days,
            perDayValue: data.perDayValue,
            timestamp: new Date(),
            actions: [
              { label: 'View Details', action: 'view', variant: 'default' }
            ]
          },
          ...prev.slice(0, 9)
        ]);
        
        // Show toast
        toast({ 
          title: "🎯 New Subscription Received!", 
          description: `${data.userName} subscribed with ₹${data.amount} (${data.days} days)`,
          action: (
            <Button size="sm" onClick={() => navigate('/seller/subscriptions')}>
              View
            </Button>
          )
        });
        
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      });

      // Subscription usage notification (when user uses subscription for restaurant order)
      socket.on('subscription_usage', (data: any) => {
        console.log('💰 Subscription used for order:', data);
        
        setNotifications(prev => [
          { 
            id: Date.now(), 
            type: 'subscription_usage', 
            title: '💰 Subscription Amount Used',
            message: `${data.userName} used ₹${data.amountUsed} from subscription for order`,
            orderId: data.orderId,
            userId: data.userId,
            userName: data.userName,
            amountUsed: data.amountUsed,
            daysDeducted: data.daysDeducted,
            remainingDays: data.remainingDays,
            timestamp: new Date()
          },
          ...prev.slice(0, 9)
        ]);
        
        // Show toast
        toast({ 
          title: "💰 Subscription Amount Used", 
          description: `${data.userName} used ₹${data.amountUsed}, ${data.daysDeducted} days deducted`,
          variant: "default"
        });
        
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [queryClient]);

  if (isLoading) return <SellerLayout title="Dashboard"><LoadingSpinner /></SellerLayout>;

  const stats = dashboard?.stats || {};
  const revenueData = dashboard?.revenueData || [];
  const recentOrders = dashboard?.recentOrders || [];
  const topItems = dashboard?.topItems || [];

  return (
    <SellerLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's your business overview"
      headerActions={
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifications([])}
                >
                  Clear All
                </Button>
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1 ${
                          notification.type === 'new_order' ? 'bg-green-500' : 
                          notification.type === 'delivery_update' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                          
                          {/* Action buttons for new orders */}
                          {notification.type === 'new_order' && notification.actions && (
                            <div className="flex gap-2 mt-3">
                              {notification.actions.map((action: any, index: number) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                                  onClick={() => {
                                    if (action.action === 'accept') {
                                      handleAcceptOrder(notification.order.orderId);
                                    } else if (action.action === 'reject') {
                                      handleRejectOrder(notification.order.orderId);
                                    }
                                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      }
    >
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-foreground">₹{stats.todayRevenue?.toLocaleString() || '0'}</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} /><span>{stats.revenueGrowth || 0}%</span><span className="text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><DollarSign size={24} className="text-primary-foreground" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Orders</p>
                <p className="text-3xl font-bold text-foreground">{stats.todayOrders || 0}</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} /><span>{stats.ordersGrowth || 0}%</span><span className="text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center"><ShoppingBag size={24} className="text-info" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Order Value</p>
                <p className="text-3xl font-bold text-foreground">₹{stats.avgOrderValue || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center"><TrendingUp size={24} className="text-warning" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <p className="text-3xl font-bold text-foreground">{stats.rating || '0'}</p>
                <p className="text-sm text-muted-foreground mt-2">{stats.totalReviews || 0} reviews</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><Star size={24} className="text-success fill-success" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between"><CardTitle className="font-display text-lg">Revenue Trend</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(16, 85%, 55%)" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-display text-lg">Orders Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(145, 60%, 45%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="font-display text-lg">Recent Orders</CardTitle></div></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id || order._id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-success/10 text-success' :
                    order.status === 'preparing' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle2 size={20} /> : order.status === 'preparing' ? <Clock size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{order.orderNumber || order.id}</p>
                      <span className="text-xs text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer} • {order.items?.length || order.itemCount} items</p>
                  </div>
                  <p className="font-semibold text-foreground">₹{order.total}</p>
                </div>
              ))}
              {recentOrders.length === 0 && <p className="text-muted-foreground text-center py-4">No recent orders</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Top Selling Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.orders || item.count} orders</p>
                  </div>
                  <p className="font-semibold text-foreground">₹{item.revenue?.toLocaleString()}</p>
                </div>
              ))}
              {topItems.length === 0 && <p className="text-muted-foreground text-center py-4">No data yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
