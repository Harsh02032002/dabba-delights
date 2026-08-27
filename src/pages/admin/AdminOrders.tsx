import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/Badge';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { Search, Clock, MapPin, RefreshCw, Eye, Download, User, Store, ShoppingBag, CreditCard } from 'lucide-react';

const statuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => adminAPI.getOrders(statusFilter === 'all' ? undefined : statusFilter),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => adminAPI.refundOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast({ title: 'Refund processed' }); },
  });

  const filteredOrders = (data?.orders || []).filter((o: any) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return o.orderNumber?.toLowerCase().includes(term) ||
      o.deliveryAddress?.city?.toLowerCase().includes(term) ||
      o.userId?.name?.toLowerCase().includes(term);
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
          <Input placeholder="Search by order number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-medium uppercase px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{order.paymentMethod}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-2">
                      {(order.items || []).map((item: any, i: number) => (
                        <span key={i} className="text-sm bg-secondary px-2 py-1 rounded-lg">{item.name} x{item.quantity}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={14} />{new Date(order.createdAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MapPin size={14} />{order.deliveryAddress?.city || 'Deoria'}</span>
                      <span>Seller: {order.sellerName || (typeof order.sellerId === 'object' ? order.sellerId?.businessName || order.sellerId?._id : order.sellerId)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-foreground">₹{order.total}</p>
                      <p className="text-xs text-muted-foreground">GST: ₹{order.gstAmount || 0}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedOrder(order)}>
                        <Eye size={14} /> Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => {
                          try { window.open(`${import.meta.env.VITE_API_URL || '/api'}/invoice/download/${order.invoiceId || order._id}`, '_blank'); } catch {}
                        }}>
                          <Download size={14} /> Invoice
                        </Button>
                      )}
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
          {filteredOrders.length === 0 && (
            <div className="text-center py-12"><p className="text-muted-foreground">No orders found</p></div>
          )}
        </div>
      )}

      {/* ═══ ORDER DETAILS MODAL ═══ */}
      <Dialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details - {selectedOrder?.orderNumber}</span>
              {selectedOrder && <StatusBadge status={selectedOrder.status} />}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-2">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><User size={12} /> Customer</p>
                  <p className="font-semibold text-sm">{selectedOrder.userId?.name || selectedOrder.deliveryAddress?.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.userId?.phone || selectedOrder.deliveryAddress?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin size={12} /> Delivery Address</p>
                  <p className="text-sm">{selectedOrder.deliveryAddress?.street || 'N/A'}, {selectedOrder.deliveryAddress?.city || 'Deoria'}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.deliveryAddress?.state || ''} {selectedOrder.deliveryAddress?.pincode || ''}</p>
                </div>
              </div>

              {/* Seller */}
              <div className="p-4 rounded-xl bg-secondary/30">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Store size={12} /> Seller / Kitchen</p>
                <p className="font-semibold text-sm">
                  {selectedOrder.sellerName || (typeof selectedOrder.sellerId === 'object' ? selectedOrder.sellerId?.businessName : selectedOrder.sellerId)}
                </p>
              </div>

              {/* Items List */}
              <div>
                <p className="text-sm font-semibold mb-3 flex items-center gap-1"><ShoppingBag size={14} /> Order Items</p>
                <div className="space-y-2 border rounded-xl p-3">
                  {(selectedOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} x ₹{item.sellingPrice || item.price}</p>
                      </div>
                      <p className="font-semibold text-sm">₹{(item.sellingPrice || item.price) * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold mb-2 flex items-center gap-1"><CreditCard size={14} /> Payment Summary</p>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{selectedOrder.subtotal || selectedOrder.total}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery Fee</span><span>₹{selectedOrder.deliveryFee || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Platform Fee</span><span>₹{selectedOrder.platformFee || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST & Taxes</span><span>₹{selectedOrder.gstAmount || 0}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{selectedOrder.discount}</span></div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Grand Total</span>
                  <span className="text-primary">₹{selectedOrder.total}</span>
                </div>
                <div className="pt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Method: <strong className="uppercase">{selectedOrder.paymentMethod}</strong></span>
                  <span>Payment Status: <strong className="capitalize">{selectedOrder.paymentStatus}</strong></span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
