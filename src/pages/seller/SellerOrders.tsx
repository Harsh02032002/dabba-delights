import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Clock, CheckCircle2, AlertCircle, Phone, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const orderStatuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function SellerOrders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', activeTab],
    queryFn: () => sellerAPI.getOrders({ status: activeTab }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => sellerAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast({ title: 'Order status updated' });
    },
  });

  const orders = (data?.orders || []).filter((order: any) =>
    order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SellerLayout title="Orders" subtitle="Manage incoming and past orders">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1 h-auto flex-wrap gap-1">
          {orderStatuses.map(status => (
            <TabsTrigger key={status} value={status} className="capitalize data-[state=active]:bg-card">
              {status.replace(/_/g, ' ')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search by order number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2"><Filter size={18} /> Filters</Button>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                      <StatusBadge status={order.status} />
                      <span className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {(order.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                          {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover" />}
                          <div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={14} />{order.deliveryAddress?.city}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />Est. 30 mins</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Order Total</p>
                      <p className="text-2xl font-bold text-foreground">₹{order.total}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <Button variant="soft-success" size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'confirmed' })}>Accept</Button>
                          <Button variant="soft-destructive" size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'cancelled' })}>Reject</Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <Button variant="gradient" size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'preparing' })}>Start Preparing</Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button variant="gradient" size="sm" onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'ready' })}>Mark Ready</Button>
                      )}
                      {order.status === 'delivered' && <Button variant="outline" size="sm">View Details</Button>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && orders.length === 0 && (
        <div className="text-center py-12"><p className="text-muted-foreground">No orders found</p></div>
      )}
    </SellerLayout>
  );
}
