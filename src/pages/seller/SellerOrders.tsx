import { useState } from 'react';
import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  MapPin,
} from 'lucide-react';
import { mockOrders } from '@/data/mockData';

const orderStatuses = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

export default function SellerOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || order.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  return (
    <SellerLayout title="Orders" subtitle="Manage incoming and past orders">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1 h-auto flex-wrap gap-1">
          {orderStatuses.map(status => (
            <TabsTrigger
              key={status}
              value={status}
              className="capitalize data-[state=active]:bg-card"
            >
              {status.replace(/_/g, ' ')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter size={18} />
          Filters
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order._id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {order.deliveryAddress.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      +91 98765 43210
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Est. 30 mins
                    </span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-2xl font-bold text-foreground">₹{order.total}</p>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'out_for_delivery' && (
                      <Button variant="outline">Track Delivery</Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline">View Details</Button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'out_for_delivery' && (
                      <Button variant="gradient">Manage Order</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </SellerLayout>
  );
}
