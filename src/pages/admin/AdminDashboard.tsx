import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, apiRequest } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Users, Store, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, AlertTriangle, CheckCircle2, Clock, Wallet,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(16, 85%, 55%)', 'hsl(145, 60%, 45%)', 'hsl(200, 80%, 50%)', 'hsl(30, 20%, 70%)'];

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard(),
  });

  const { data: walletData } = useQuery({
    queryKey: ['admin-wallet'],
    queryFn: async () => {
      const res = await apiRequest('/user/wallet/transactions');
      return res?.data || res || {};
    },
  });

  if (isLoading) return <AdminLayout title="Admin Dashboard"><LoadingSpinner /></AdminLayout>;

  const stats = dashboard?.stats || {};
  const revenueData = dashboard?.revenueData || [];
  const cityData = dashboard?.cityData || [];
  const pendingApprovals = dashboard?.pendingApprovals || [];
  const topSellers = dashboard?.topSellers || [];
  const health = dashboard?.health || {};
  const adminWalletBalance = Number(walletData?.balance || 0);

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Platform overview and management">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">₹{stats.totalRevenue?.toLocaleString() || '0'}</p>
              <div className="flex items-center gap-1 mt-2 text-success text-sm"><ArrowUpRight size={14} /><span>{stats.revenueGrowth || 0}%</span></div>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><DollarSign size={24} className="text-primary-foreground" /></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalOrders?.toLocaleString() || '0'}</p>
              <div className="flex items-center gap-1 mt-2 text-success text-sm"><ArrowUpRight size={14} /><span>{stats.ordersGrowth || 0}%</span></div>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center"><ShoppingBag size={24} className="text-primary-foreground" /></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Sellers</p>
              <p className="text-3xl font-bold text-foreground">{stats.activeSellers?.toLocaleString() || '0'}</p>
              <div className="flex items-center gap-1 mt-2 text-success text-sm"><ArrowUpRight size={14} /><span>{stats.sellersGrowth || 0}%</span></div>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center"><Store size={24} className="text-primary-foreground" /></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Platform Wallet</p>
              <p className="text-3xl font-bold text-foreground">₹{adminWalletBalance.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-primary text-sm"><Wallet size={14} /><span>Platform Fees</span></div>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-info flex items-center justify-center"><Wallet size={24} className="text-primary-foreground" /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(16, 85%, 55%)" fill="hsl(16, 85%, 55%, 0.3)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by City</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={cityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Health */}
      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-success/10 rounded-xl p-4 flex items-center gap-3"><CheckCircle2 className="text-success" size={24} /><div><p className="font-medium text-foreground">Platform Health</p><p className="text-sm text-muted-foreground">{health.status || 'Operational'}</p></div></div>
        <div className="bg-warning/10 rounded-xl p-4 flex items-center gap-3"><Clock className="text-warning" size={24} /><div><p className="font-medium text-foreground">Pending Approvals</p><p className="text-sm text-muted-foreground">{health.pendingApprovals || 0} sellers</p></div></div>
        <div className="bg-info/10 rounded-xl p-4 flex items-center gap-3"><TrendingUp className="text-info" size={24} /><div><p className="font-medium text-foreground">Commission Earned</p><p className="text-sm text-muted-foreground">₹{health.commissionEarned?.toLocaleString() || '0'}</p></div></div>
        <div className="bg-destructive/10 rounded-xl p-4 flex items-center gap-3"><AlertTriangle className="text-destructive" size={24} /><div><p className="font-medium text-foreground">Refund Requests</p><p className="text-sm text-muted-foreground">{health.refundRequests || 0} pending</p></div></div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="font-display text-lg">Revenue & Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs><linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? `₹${(v / 1000).toFixed(0)}K` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(16, 85%, 55%)" strokeWidth={2} fill="url(#adminRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-display text-lg">Revenue by City</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart><Pie data={cityData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" nameKey="name">
                  {cityData.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie><Tooltip /></RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {cityData.map((c: any, i: number) => (
                <div key={c.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-sm text-muted-foreground">{c.name}</span><span className="text-sm font-medium ml-auto">{c.value}%</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="font-display text-lg">Pending Seller Approvals</CardTitle></div></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((seller: any) => (
                <div key={seller._id || seller.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Store size={20} className="text-warning" /></div>
                  <div className="flex-1 min-w-0"><p className="font-medium text-foreground">{seller.name || seller.businessName}</p><p className="text-sm text-muted-foreground">{seller.type} • {seller.city} • {seller.submitted}</p></div>
                  <div className="flex gap-2"><Button size="sm" variant="soft-success">Approve</Button><Button size="sm" variant="ghost">Review</Button></div>
                </div>
              ))}
              {pendingApprovals.length === 0 && <p className="text-muted-foreground text-center py-4">No pending approvals</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Top Performing Sellers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.map((seller: any, index: number) => (
                <div key={seller.name} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-warning/20 text-warning' : index === 1 ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground'}`}>{index + 1}</div>
                  <div className="flex-1 min-w-0"><p className="font-medium text-foreground">{seller.name}</p><p className="text-sm text-muted-foreground">{seller.orders} orders • ⭐ {seller.rating}</p></div>
                  <p className="font-semibold text-foreground">₹{(seller.revenue / 1000).toFixed(0)}K</p>
                </div>
              ))}
              {topSellers.length === 0 && <p className="text-muted-foreground text-center py-4">No data yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
