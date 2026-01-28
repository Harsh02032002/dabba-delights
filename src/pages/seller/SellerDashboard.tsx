import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const revenueData = [
  { date: 'Mon', revenue: 4500, orders: 18 },
  { date: 'Tue', revenue: 5200, orders: 22 },
  { date: 'Wed', revenue: 4800, orders: 20 },
  { date: 'Thu', revenue: 6100, orders: 28 },
  { date: 'Fri', revenue: 7200, orders: 35 },
  { date: 'Sat', revenue: 8500, orders: 42 },
  { date: 'Sun', revenue: 7800, orders: 38 },
];

const topItems = [
  { name: 'Butter Chicken', orders: 145, revenue: 36250 },
  { name: 'Dal Makhani', orders: 128, revenue: 23040 },
  { name: 'Paneer Tikka', orders: 112, revenue: 22400 },
  { name: 'Jeera Rice', orders: 98, revenue: 11760 },
];

const recentOrders = [
  { id: 'DN-001', customer: 'Rahul M.', items: 2, total: 450, status: 'preparing', time: '5 min ago' },
  { id: 'DN-002', customer: 'Priya S.', items: 3, total: 680, status: 'confirmed', time: '12 min ago' },
  { id: 'DN-003', customer: 'Amit K.', items: 1, total: 250, status: 'delivered', time: '25 min ago' },
  { id: 'DN-004', customer: 'Neha P.', items: 4, total: 920, status: 'out_for_delivery', time: '30 min ago' },
];

export default function SellerDashboard() {
  return (
    <SellerLayout title="Dashboard" subtitle="Welcome back! Here's your business overview">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-foreground">₹8,540</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} />
                  <span>12.5%</span>
                  <span className="text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Today's Orders</p>
                <p className="text-3xl font-bold text-foreground">42</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} />
                  <span>8.2%</span>
                  <span className="text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <ShoppingBag size={24} className="text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Order Value</p>
                <p className="text-3xl font-bold text-foreground">₹285</p>
                <div className="flex items-center gap-1 mt-2 text-destructive text-sm">
                  <ArrowDownRight size={14} />
                  <span>2.1%</span>
                  <span className="text-muted-foreground">vs last week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <TrendingUp size={24} className="text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <p className="text-3xl font-bold text-foreground">4.8</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <span>Based on 1,250 reviews</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Star size={24} className="text-success fill-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Revenue Trend</CardTitle>
              <Button variant="ghost" size="sm">This Week</Button>
            </div>
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
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(30, 40%, 99%)',
                      border: '1px solid hsl(30, 20%, 90%)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(16, 85%, 55%)"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Orders Overview</CardTitle>
              <Button variant="ghost" size="sm">This Week</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(30, 40%, 99%)',
                      border: '1px solid hsl(30, 20%, 90%)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(145, 60%, 45%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-success/10 text-success' :
                    order.status === 'preparing' ? 'bg-warning/10 text-warning' :
                    order.status === 'out_for_delivery' ? 'bg-info/10 text-info' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {order.status === 'delivered' ? <CheckCircle2 size={20} /> :
                     order.status === 'preparing' ? <Clock size={20} /> :
                     <AlertCircle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{order.id}</p>
                      <span className="text-xs text-muted-foreground">{order.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer} • {order.items} items
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">₹{order.total}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Top Selling Items</CardTitle>
              <Button variant="ghost" size="sm">This Month</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                  </div>
                  <p className="font-semibold text-foreground">₹{item.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}
