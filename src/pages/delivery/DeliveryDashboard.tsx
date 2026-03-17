import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";
import {
  MapPin, Package, Clock, DollarSign, Navigation, Bell, User, LogOut,
  CheckCircle, XCircle, ArrowRight
} from "lucide-react";
import { deliveryAPI } from "@/lib/api";

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantAddress: string;
  totalAmount: number;
  estimatedTime: string;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🗺️ Location Detection for Rider
  const detectRiderLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Rider location detected:', { latitude, longitude });
          
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Update location in backend
          try {
            await deliveryAPI.updateLocation({
              latitude,
              longitude,
              address: "Current Location"
            });
            
            toast({ 
              title: "📍 Location Updated", 
              description: `Your location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            });
          } catch (error) {
            console.error('❌ Failed to update location:', error);
            toast({ 
              title: "Location Error", 
              description: "Failed to update location in backend" 
            });
          }
        },
        (error) => {
          console.error('❌ Location detection failed:', error);
          toast({ 
            title: "Location Error", 
            description: "Failed to detect your location. Please enable GPS." 
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast({ 
        title: "Not Supported", 
        description: "Geolocation is not supported", 
        variant: "destructive" 
      });
    }
  };

  // 📍 Fetch current location from backend
  const fetchCurrentLocation = async () => {
    try {
      const profile = await deliveryAPI.getPartnerProfile();
      if (profile.currentLocation && profile.currentLocation.coordinates) {
        const [lng, lat] = profile.currentLocation.coordinates;
        setCurrentLocation({ lat, lng });
        console.log('📍 Location fetched from backend:', { lat, lng });
      }
    } catch (error) {
      console.error('❌ Failed to fetch location from backend:', error);
    }
  };

  // � Go Online/Offline
  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await deliveryAPI.toggleOnline(newStatus);
      setIsOnline(newStatus);
      
      toast({ 
        title: newStatus ? "🟢 You're Online" : "🔴 You're Offline", 
        description: newStatus ? "Ready to receive orders" : "Not receiving orders" 
      });

      // Join/leave delivery room
      if (socket) {
        if (newStatus) {
          socket.emit('join_delivery_room', user?.deliveryPartnerId);
        } else {
          socket.emit('leave_delivery_room', user?.deliveryPartnerId);
        }
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  // 📦 Handle Order Response
  const handleOrderResponse = async (orderId: string, response: 'accept' | 'reject') => {
    try {
      setIsLoading(true);
      
      if (response === 'accept') {
        await deliveryAPI.acceptOrder(orderId);
        toast({ title: "✅ Order Accepted", description: "Navigate to restaurant" });
      } else {
        await deliveryAPI.rejectOrder(orderId);
        toast({ title: "❌ Order Rejected", description: "Order rejected successfully" });
      }
      
      // Remove from active orders
      setActiveOrders(prev => prev.filter(order => order._id !== orderId));
      
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 📦 Update Delivery Status
  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      await deliveryAPI.updateDeliveryStatus(orderId, { 
        status,
        location: currentLocation 
      });
      
      toast({ 
        title: "✅ Status Updated", 
        description: `Delivery status: ${status}` 
      });
      
      // Refresh orders
      fetchActiveOrders();
      
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  // 📦 Fetch Active Orders
  const fetchActiveOrders = async () => {
    try {
      const response = await deliveryAPI.getActiveOrders();
      setActiveOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  // 🔌 Socket Connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🛵 Delivery partner connected to socket');
      
      // Join delivery room if online
      if (isOnline && user?.deliveryPartnerId) {
        newSocket.emit('join_delivery_room', user.deliveryPartnerId);
      }
    });

    newSocket.on('delivery_request', (order: Order) => {
      console.log('📦 New delivery request:', order);
      
      // Add to active orders
      setActiveOrders(prev => [order, ...prev]);
      
      // Add notification
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'delivery_request',
          title: '🛵 New Delivery Request',
          message: `${order.restaurantName} → ${order.customerName}`,
          order,
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
      
      // Show toast
      toast({
        title: "🛵 New Delivery Request!",
        description: `${order.restaurantName} → ${order.customerName}`,
        action: (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleOrderResponse(order._id, 'accept')}>
              Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleOrderResponse(order._id, 'reject')}>
              Reject
            </Button>
          </div>
        )
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isOnline, user?.deliveryPartnerId]);

  // 🔄 Initial Load
  useEffect(() => {
    fetchActiveOrders();
    detectRiderLocation();
    
    // Auto-detect location every 30 seconds
    const locationInterval = setInterval(detectRiderLocation, 30000);
    
    return () => clearInterval(locationInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-effect border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-bold text-foreground">Delivery Dashboard</h1>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
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
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-2">
              <User size={16} />
              <span className="text-sm">{user?.name}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Location & Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Location Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Location</p>
                <p className="font-medium">
                  {currentLocation ? 
                    `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 
                    "Detecting..."
                  }
                </p>
              </div>
              <Button onClick={detectRiderLocation} className="w-full">
                <Navigation size={16} className="mr-2" />
                Update Location
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={isOnline ? "default" : "secondary"}>
                  {isOnline ? "🟢 Online - Receiving Orders" : "🔴 Offline - Not Receiving Orders"}
                </Badge>
              </div>
              <Button 
                onClick={toggleOnlineStatus} 
                variant={isOnline ? "destructive" : "default"}
                className="w-full"
              >
                {isOnline ? "🔴 Go Offline" : "🟢 Go Online"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package size={20} />
              Delivery Requests ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No delivery requests</p>
                <p className="text-sm">Go online to receive orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <Card key={order._id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{order.orderNumber}</h3>
                            <Badge variant="outline">{order.estimatedTime}</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Package size={14} />
                              <span><strong>Pickup:</strong> {order.restaurantName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span><strong>Delivery:</strong> {order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign size={14} />
                              <span><strong>Earning:</strong> ₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleOrderResponse(order._id, 'accept')}
                            disabled={isLoading}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleOrderResponse(order._id, 'reject')}
                            disabled={isLoading}
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
