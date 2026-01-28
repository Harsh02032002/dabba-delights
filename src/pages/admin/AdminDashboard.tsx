import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Clock,
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
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

const revenueData = [
  { date: 'Jan', revenue: 245000, orders: 1240 },
  { date: 'Feb', revenue: 280000, orders: 1450 },
  { date: 'Mar', revenue: 320000, orders: 1680 },
  { date: 'Apr', revenue: 290000, orders: 1520 },
  { date: 'May', revenue: 380000, orders: 1950 },
  { date: 'Jun', revenue: 420000, orders: 2100 },
];

const cityData = [
  { name: 'Mumbai', value: 42 },
  { name: 'Delhi', value: 28 },
  { name: 'Bangalore', value: 18 },
  { name: 'Others', value: 12 },
];

const COLORS = ['hsl(16, 85%, 55%)', 'hsl(145, 60%, 45%)', 'hsl(200, 80%, 50%)', 'hsl(30, 20%, 70%)'];

const pendingApprovals = [
  { id: 1, name: 'Sharma Kitchen', type: 'Home Chef', city: 'Mumbai', submitted: '2 hours ago' },
  { id: 2, name: 'Royal Biryani', type: 'Restaurant', city: 'Delhi', submitted: '5 hours ago' },
  { id: 3, name: "Mom's Tiffin", type: 'Home Chef', city: 'Pune', submitted: '1 day ago' },
];

const topSellers = [
  { name: "Priya's Kitchen", orders: 1250, revenue: 312500, rating: 4.8 },
  { name: 'Biryani Blues', orders: 980, revenue: 392000, rating: 4.6 },
  { name: "Grandma's Dabba", orders: 890, revenue: 160200, rating: 4.9 },
  { name: 'The Spice Route', orders: 750, revenue: 375000, rating: 4.5 },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Admin Dashboard" subtitle="Platform overview and management">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">₹19.3L</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} />
                  <span>18.2%</span>
                  <span className="text-muted-foreground">this month</span>
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
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">12,450</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} />
                  <span>12.5%</span>
                  <span className="text-muted-foreground">this month</span>
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
                <p className="text-sm text-muted-foreground mb-1">Active Sellers</p>
                <p className="text-3xl font-bold text-foreground">248</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} />
                  <span>8 new</span>
                  <span className="text-muted-foreground">this week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Store size={24} className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-3xl font-bold text-foreground">45.2K</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight size={14} />
                  <span>24%</span>
                  <span className="text-muted-foreground">growth</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Users size={24} className="text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-success/10 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-success" size={24} />
          <div>
            <p className="font-medium text-foreground">Platform Health</p>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>
        <div className="bg-warning/10 rounded-xl p-4 flex items-center gap-3">
          <Clock className="text-warning" size={24} />
          <div>
            <p className="font-medium text-foreground">Pending Approvals</p>
            <p className="text-sm text-muted-foreground">3 sellers awaiting review</p>
          </div>
        </div>
        <div className="bg-info/10 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp className="text-info" size={24} />
          <div>
            <p className="font-medium text-foreground">Commission Earned</p>
            <p className="text-sm text-muted-foreground">₹2.89L this month</p>
          </div>
        </div>
        <div className="bg-destructive/10 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-destructive" size={24} />
          <div>
            <p className="font-medium text-foreground">Refund Requests</p>
            <p className="text-sm text-muted-foreground">12 pending review</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Revenue & Orders</CardTitle>
              <Button variant="ghost" size="sm">Last 6 Months</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(30, 40%, 99%)',
                      border: '1px solid hsl(30, 20%, 90%)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `₹${(value / 1000).toFixed(0)}K` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(16, 85%, 55%)"
                    strokeWidth={2}
                    fill="url(#adminRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* City Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Revenue by City</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={cityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {cityData.map((city, index) => (
                <div key={city.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-muted-foreground">{city.name}</span>
                  <span className="text-sm font-medium ml-auto">{city.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Pending Seller Approvals</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((seller) => (
                <div key={seller.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Store size={20} className="text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{seller.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {seller.type} • {seller.city} • {seller.submitted}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="soft-success">Approve</Button>
                    <Button size="sm" variant="ghost">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">Top Performing Sellers</CardTitle>
              <Button variant="ghost" size="sm">This Month</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.map((seller, index) => (
                <div key={seller.name} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-warning/20 text-warning' :
                    index === 1 ? 'bg-muted text-muted-foreground' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{seller.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {seller.orders} orders • ⭐ {seller.rating}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">₹{(seller.revenue / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
