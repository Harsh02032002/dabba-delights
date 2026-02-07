import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  DollarSign, ShoppingBag, TrendingUp, Star, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

export default function SellerDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: () => sellerAPI.getDashboard(),
  });

  if (isLoading) return <SellerLayout title="Dashboard"><LoadingSpinner /></SellerLayout>;

  const stats = dashboard?.stats || {};
  const revenueData = dashboard?.revenueData || [];
  const recentOrders = dashboard?.recentOrders || [];
  const topItems = dashboard?.topItems || [];

  return (
    <SellerLayout title="Dashboard" subtitle="Welcome back! Here's your business overview">
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
