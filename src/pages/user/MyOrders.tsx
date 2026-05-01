import { useState, useEffect } from "react";
import { UserLayout } from "@/layouts/UserLayout";
import { userAPI } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Star, Clock, CheckCircle, Package, Truck, ShoppingBag, MapPin,Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/hooks/use-toast";
import { UserRatingModal } from "@/components/user/UserRatingModal";
import OrderTrackingMap from "@/components/user/OrderTrackingMap";
import { io } from 'socket.io-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusTabs = ['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function OrderTracker({ status }: { status: string }) {
  const currentIdx = statusSteps.findIndex(s => s.key === status);
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm font-medium mt-3">
        <span className="w-3 h-3 rounded-full bg-destructive" />
        Order Cancelled
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
      {statusSteps.map((step, idx) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center min-w-[60px]">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              idx <= currentIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {idx <= currentIdx ? '✓' : idx + 1}
            </div>
            <span className={`text-[10px] mt-1 text-center leading-tight ${
              idx <= currentIdx ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>{step.label}</span>
          </div>
          {idx < statusSteps.length - 1 && (
            <div className={`w-6 h-0.5 ${idx < currentIdx ? 'bg-primary' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [deliveryLocations, setDeliveryLocations] = useState<{ [key: string]: any }>({});
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToAction, setOrderToAction] = useState<any>(null);

  // Socket.io connection for real-time order updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    
    if (socket) {
      socket.on('connect', () => {
        console.log('User connected to socket');
      });

      socket.on('order_status_update', (data: any) => {
        console.log('Order status update received:', data);
        // Refresh orders when status changes
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      });

      socket.on('delivery_location_update', (data: any) => {
        console.log('Delivery location update received:', data);
        setDeliveryLocations(prev => ({

          ...prev,
          [data.orderId]: {
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date(),
            address: data.address
          }
        }));
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders', activeTab],
    queryFn: async () => {
      console.log('🌐 Frontend calling API with tab:', activeTab);
      const res = await userAPI.getOrders(activeTab === 'all' ? undefined : activeTab);
      console.log('🌐 Raw API response:', res);
      
      let orders = [];
      if (res && typeof res === 'object') {
        if (Array.isArray(res)) {
          orders = res;
        } else if (res.orders && Array.isArray(res.orders)) {
          orders = res.orders;
        } else if (res.data && Array.isArray(res.data)) {
          orders = res.data;
        }
      }
      
      console.log('🌐 Parsed orders:', orders);
      console.log('🌐 Orders count:', orders.length);
      
      return orders;
    },
  });

  const orders = (Array.isArray(data) ? data : []).filter((o: any) =>
    activeTab === 'all' || o.status === activeTab
  );

  const handleDeleteOrder = (order: any) => {
    setOrderToAction(order);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToAction) return;
    try {
      await userAPI.deleteOrder(orderToAction._id);
      toast({
        title: 'Order Deleted',
        description: `Order ${orderToAction.orderNumber} has been permanently deleted`,
      });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToAction(null);
    }
  };

  const handleCancelOrder = (order: any) => {
    setOrderToAction(order);
    setIsCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToAction) return;
    try {
      await userAPI.cancelOrder(orderToAction._id);
      toast({
        title: 'Order Cancelled',
        description: `Order ${orderToAction.orderNumber} has been successfully cancelled.`,
      });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelDialogOpen(false);
      setOrderToAction(null);
    }
  };

  const handleRateOrder = (order: any) => {
    setSelectedOrder(order);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = () => {
    setRatingModalOpen(false);
    setSelectedOrder(null);
    // Refetch orders to show updated rating
    window.location.reload();
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground">{orders.length} orders</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-secondary p-1 h-auto flex-wrap gap-1">
            {statusTabs.map(s => (
              <TabsTrigger key={s} value={s} className="capitalize data-[state=active]:bg-card text-xs">
                {s.replace(/_/g, ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-4">Start ordering delicious food!</p>
            <Button variant="gradient" onClick={() => navigate('/')}>Browse Food</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const sellerObj = typeof order.sellerId === 'object' ? order.sellerId : null;
              const sellerName = sellerObj?.businessName || order.sellerName || 'Seller';
              return (
                <Card key={order._id} className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {sellerName} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                            {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />}
                            <span className="text-sm">{item.name} x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <OrderTracker status={order.status} />
                      
                      {/* Add tracking map for active orders */}
                      {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'out_for_delivery') && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <MapPin size={16} />
                            Live Order Tracking
                          </h4>
                          <OrderTrackingMap 
                            order={order} 
                            deliveryLocation={deliveryLocations[order._id]}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-foreground">₹{order.total}</p>
                      
                      {/* Subscription Billing Info */}
                      {order.subscriptionAmountUsed > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
                          <div className="text-green-800 font-semibold">Subscription Used</div>
                          <div className="text-green-600">-₹{order.subscriptionAmountUsed}</div>
                          {order.subscriptionDaysDeducted > 0 && (
                            <div className="text-green-600">-{order.subscriptionDaysDeducted} days</div>
                          )}
                          {order.payableAfterSubscription > 0 && (
                            <div className="border-t border-green-200 mt-1 pt-1">
                              <div className="text-green-800 font-semibold">Paid: ₹{order.payableAfterSubscription}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                      
                      {order.status === 'delivered' && !order.rating && (
                        <Button size="sm" variant="outline" onClick={() => handleRateOrder(order)} className="gap-1">
                          <Star size={14} /> Rate Order
                        </Button>
                      )}
                      {order.rating && (
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= order.rating ? 'fill-warning text-warning' : 'text-muted-foreground'} />
                          ))}
                        </div>
                      )}
                      
                      {/* Invoice Download Button - Always Visible */}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-1 text-xs" 
                        onClick={() => {
                          try {
                            console.log("Attempting to download invoice for order:", order._id);
                            userAPI.downloadInvoice(order._id);
                          } catch (error) {
                            console.error("Invoice download failed:", error);
                            toast({
                              title: "Error",
                              description: "Failed to download invoice. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Download size={14} /> Invoice
                      </Button>

                      {/* Cancel Order Button - Only for cancellable orders */}
                      {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="gap-1 text-xs" 
                          onClick={() => handleCancelOrder(order)}
                        >
                          <Package size={14} /> Cancel Order
                        </Button>
                      )}

                      {/* Delete Order Button - Only for cancelled orders */}
                      {order.status === 'cancelled' && (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="gap-1 text-xs" 
                          onClick={() => handleDeleteOrder(order)}
                        >
                          <Trash2 size={14} /> Delete Order
                        </Button>
                      )}

                      {/* Live Location Tracking */}
                      {order.status === 'out_for_delivery' && deliveryLocations[order._id] && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">Live Delivery Tracking</span>
                          </div>
                          <div className="text-xs text-blue-600">
                            Last updated: {new Date(deliveryLocations[order._id].timestamp).toLocaleTimeString()}
                          </div>
                          <div className="text-sm text-blue-800">
                            📍 {deliveryLocations[order._id].address || 'Location updating...'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {orderToAction?.orderNumber}? This action will credit any paid amount back to your wallet or subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Order Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete order {orderToAction?.orderNumber} from your history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Modal */}
      {selectedOrder && (
        <UserRatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          orderId={selectedOrder._id}
          sellerName={typeof selectedOrder.sellerId === 'object' ? selectedOrder.sellerId.businessName : selectedOrder.sellerName || 'Seller'}
          onRatingSubmit={handleRatingSubmit}
        />
      )}
    </UserLayout>
  );
}
