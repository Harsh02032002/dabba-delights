import { useState } from "react";
import { UserLayout } from "@/layouts/UserLayout";
import { userAPI } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Star, Clock, CheckCircle, Package, Truck, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/hooks/use-toast";
import { UserRatingModal } from "@/components/user/UserRatingModal";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['user-orders', activeTab],
    queryFn: async () => {
      const res = await userAPI.getOrders(activeTab === 'all' ? undefined : activeTab);
      const orders = Array.isArray(res) ? res : res?.orders || res?.data || [];
      return orders;
    },
  });

  const orders = (Array.isArray(data) ? data : []).filter((o: any) =>
    activeTab === 'all' || o.status === activeTab
  );

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
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-foreground">₹{order.total}</p>
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
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
