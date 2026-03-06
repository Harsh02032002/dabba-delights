import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Globe, ShoppingBag, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(16, 85%, 55%)', 'hsl(145, 60%, 45%)', 'hsl(200, 80%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(270, 60%, 55%)'];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('monthly');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminAPI.getAnalytics(period),
  });

  const { data: cityData } = useQuery({
    queryKey: ['admin-city-revenue'],
    queryFn: () => adminAPI.getCityWiseRevenue(),
  });

  const { data: categoryData } = useQuery({
    queryKey: ['admin-category-sales'],
    queryFn: () => adminAPI.getCategoryWiseSales(),
  });

  const { data: cartDropoffs } = useQuery({
    queryKey: ['admin-cart-dropoffs'],
    queryFn: () => adminAPI.getCartDropoffs(),
  });

  const citySeries = (cityData?.cityData || []).map((c: any) => ({
    city: c._id || 'Unknown',
    revenue: c.revenue,
    orders: c.orders,
  }));

  const categorySeries = (categoryData?.categoryData || []).map((c: any) => ({
    category: c._id || 'Unknown',
    sales: c.quantity,
    revenue: c.revenue,
  }));

  return (
    <AdminLayout title="Analytics" subtitle="Platform-wide analytics and insights">
      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-card">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-card">Monthly</TabsTrigger>
          <TabsTrigger value="yearly" className="data-[state=active]:bg-card">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <LoadingSpinner /> : (
        <>
          {/* Revenue Chart */}
          <Card className="mb-8">
            <CardHeader><CardTitle className="font-display text-lg">Platform Revenue</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueData || []}>
                    <defs>
                      <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(16, 85%, 55%)" strokeWidth={2} fill="url(#adminRevGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* City-wise Revenue */}
            <Card>
              <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Globe size={20} /> City-wise Revenue</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={citySeries} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="revenue" nameKey="city">
                        {citySeries.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {citySeries.map((c: any, i: number) => (
                    <div key={c.city} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-muted-foreground">{c.city}</span>
                      <span className="text-sm font-medium ml-auto">₹{(c.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category-wise Sales */}
            <Card>
              <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><ShoppingBag size={20} /> Category-wise Sales</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorySeries} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(30, 20%, 90%)" />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} width={100} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="hsl(145, 60%, 45%)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Dropoffs */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><TrendingDown size={20} /> Cart Drop-off Analytics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                  <p className="text-3xl font-bold text-foreground">{cartDropoffs?.totalCarts || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Carts Created</p>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-xl">
                  <p className="text-3xl font-bold text-success">{cartDropoffs?.completedCarts || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-xl">
                  <p className="text-3xl font-bold text-destructive">{cartDropoffs?.dropoffRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Drop-off Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
