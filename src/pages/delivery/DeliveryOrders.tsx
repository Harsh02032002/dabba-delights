import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Package, MapPin, Clock, CheckCircle, Navigation, Phone,
  ArrowRight, User, Store, DollarSign
} from "lucide-react";
import { deliveryAPI } from "@/lib/api";

interface DeliveryOrder {
  _id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
  };
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    sellingPrice: number;
  }>;
  totalAmount: number;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
  }>;
}

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🗺️ Get Current Location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          console.log('📍 Current location:', { latitude, longitude });
        },
        (error) => {
          console.error('❌ Location error:', error);
          toast({
            title: "Location Error",
            description: "Could not get your location",
            variant: "destructive"
          });
        }
      );
    }
  };

  // 📦 Update Delivery Status
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsLoading(true);
      
      await deliveryAPI.updateDeliveryStatus(orderId, {
        status: newStatus,
        location: currentLocation
      });

      toast({
        title: "✅ Status Updated",
        description: `Delivery status: ${newStatus.replace('_', ' ')}`
      });

      // Refresh orders
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "❌ Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 📱 Get Directions
  const getDirections = (address: string) => {
    if (currentLocation) {
      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Location Required",
        description: "Please update your location first",
        variant: "destructive"
      });
    }
  };

  // 📞 Make Phone Call
  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  // 📦 Fetch Orders
  const fetchOrders = async () => {
    try {
      const response = await deliveryAPI.getActiveOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    getCurrentLocation();
    
    // Update location every 30 seconds
    const locationInterval = setInterval(getCurrentLocation, 30000);
    
    return () => clearInterval(locationInterval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return 'bg-blue-500';
      case 'arrived_at_restaurant': return 'bg-orange-500';
      case 'order_picked_up': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation size={20} />
            Location Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Location</p>
              <p className="font-medium">
                {currentLocation ? 
                  `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 
                  "Detecting..."
                }
              </p>
            </div>
            <Button onClick={getCurrentLocation} size="sm">
              <Navigation size={14} className="mr-2" />
              Update Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Package size={20} />
          Active Deliveries ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
              <p className="text-gray-500">You don't have any active deliveries right now</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                    <p className="text-sm opacity-90">₹{order.totalAmount} • {order.items.length} items</p>
                  </div>
                  <Badge className="bg-white text-orange-600">
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Status Timeline */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">Delivery Timeline</span>
                  </div>
                  <div className="space-y-2">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(history.status)}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getStatusText(history.status)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(history.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Store size={16} className="text-orange-600" />
                        <span className="font-medium text-orange-900">Pickup Location</span>
                      </div>
                      <p className="font-medium">{order.restaurantName}</p>
                      <p className="text-sm text-gray-600 mb-2">{order.restaurantAddress.fullAddress}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => getDirections(order.restaurantAddress.fullAddress)}
                        >
                          <Navigation size={14} className="mr-1" />
                          Directions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => makeCall(order.restaurantPhone)}
                        >
                          <Phone size={14} className="mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-blue-600" />
                        <span className="font-medium text-blue-900">Delivery Location</span>
                      </div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-600 mb-2">{order.customerAddress.fullAddress}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => getDirections(order.customerAddress.fullAddress)}
                        >
                          <Navigation size={14} className="mr-1" />
                          Directions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => makeCall(order.customerPhone)}
                        >
                          <Phone size={14} className="mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Order Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{item.sellingPrice * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status === 'out_for_delivery' && (
                    <Button
                      onClick={() => updateStatus(order._id, 'arrived_at_restaurant')}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Store size={16} className="mr-2" />
                      Arrived at Restaurant
                    </Button>
                  )}
                  
                  {order.status === 'arrived_at_restaurant' && (
                    <Button
                      onClick={() => updateStatus(order._id, 'order_picked_up')}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Package size={16} className="mr-2" />
                      Order Picked Up
                    </Button>
                  )}
                  
                  {order.status === 'order_picked_up' && (
                    <Button
                      onClick={() => updateStatus(order._id, 'delivered')}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
