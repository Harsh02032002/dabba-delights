import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/Badge';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Search, Clock, MapPin, RefreshCw, Eye } from 'lucide-react';

const statuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => adminAPI.getOrders(statusFilter === 'all' ? undefined : statusFilter),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => adminAPI.refundOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast({ title: 'Refund processed' }); },
  });

  return (
    <AdminLayout title="Order Management" subtitle="View and manage all platform orders">
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="bg-secondary p-1 h-auto flex-wrap gap-1">
          {statuses.map(s => (
            <TabsTrigger key={s} value={s} className="capitalize data-[state=active]:bg-card">{s.replace(/_/g, ' ')}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search by order number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {(data?.orders || []).map((order: any) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                      <StatusBadge status={order.status} />
                      <span className="text-sm text-muted-foreground">{order.paymentMethod}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-2">
                      {(order.items || []).map((item: any, i: number) => (
                        <span key={i} className="text-sm bg-secondary px-2 py-1 rounded-lg">{item.name} x{item.quantity}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={14} />{new Date(order.createdAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} />{order.deliveryAddress?.city}</span>
                      <span>Seller: {order.sellerName || order.sellerId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-foreground">₹{order.total}</p>
                      <p className="text-xs text-muted-foreground">GST: ₹{order.gstAmount}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="gap-1"><Eye size={14} /> Details</Button>
                      {order.status === 'delivered' && order.paymentStatus === 'paid' && (
                        <Button variant="soft-destructive" size="sm" className="gap-1" onClick={() => refundMutation.mutate(order._id)}>
                          <RefreshCw size={14} /> Refund
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!data?.orders || data.orders.length === 0) && (
            <div className="text-center py-12"><p className="text-muted-foreground">No orders found</p></div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
