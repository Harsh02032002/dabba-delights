import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sellerAPI } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  TrendingUp, ShoppingBag, BarChart3, Repeat,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { safeArray } from '@/utils/safeArray';

const COLORS = ['hsl(16, 85%, 55%)', 'hsl(145, 60%, 45%)', 'hsl(200, 80%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(270, 60%, 55%)'];

export default function SellerAnalytics() {
  const [period, setPeriod] = useState('weekly');

  const { data: analyticsRaw, isLoading } = useQuery({
    queryKey: ['seller-analytics', period],
    queryFn: () => sellerAPI.getAnalytics(period),
  });

  const { data: topItemsRaw } = useQuery({
    queryKey: ['seller-top-items'],
    queryFn: () => sellerAPI.getTopItems(),
  });

  const { data: peakHoursRaw } = useQuery({
    queryKey: ['seller-peak-hours'],
    queryFn: () => sellerAPI.getPeakHours(),
  });

  const { data: repeatCustomersRaw } = useQuery({
    queryKey: ['seller-repeat-customers'],
    queryFn: () => sellerAPI.getRepeatCustomers(),
  });

  // Normalize data from backend { success, ...data } format
  const analytics = analyticsRaw as any;
  const topItems = safeArray((topItemsRaw as any)?.data || (topItemsRaw as any)?.topItems);
  const peakHours = safeArray((peakHoursRaw as any)?.data || (peakHoursRaw as any)?.peakHours);
  const repeatCount = (repeatCustomersRaw as any)?.count ?? 0;
  const repeatPercentage = (repeatCustomersRaw as any)?.percentage ?? 0;

  return (
    <SellerLayout title="Analytics" subtitle="Deep insights into your business performance">
      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-card">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-card">Monthly</TabsTrigger>
          <TabsTrigger value="yearly" className="data-[state=active]:bg-card">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-foreground">₹{(analytics?.totalRevenue ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <TrendingUp size={24} className="text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-foreground">{analytics?.totalOrders ?? 0}</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Repeat Customers</p>
                    <p className="text-3xl font-bold text-foreground">{repeatCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Repeat size={24} className="text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                    <p className="text-3xl font-bold text-foreground">₹{analytics?.averageOrderValue ?? 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <BarChart3 size={24} className="text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Revenue Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeArray(analytics?.dailyRevenue)}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(16, 85%, 55%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(v: number) => [`₹${v}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(16, 85%, 55%)" strokeWidth={2} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Peak Order Hours</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tickFormatter={(h) => `${h}:00`} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip labelFormatter={(h) => `${h}:00`} />
                      <Bar dataKey="orders" fill="hsl(145, 60%, 45%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Items & Repeat Customer Rate */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Top Selling Items</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item: any, index: number) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, color: COLORS[index % COLORS.length] }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.count} orders</p>
                      </div>
                      <p className="font-semibold text-foreground">₹{item.revenue?.toLocaleString()}</p>
                    </div>
                  ))}
                  {topItems.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Repeat Customer Rate</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center mx-auto mb-4 relative">
                      <div
                        className="absolute inset-0 rounded-full border-8 border-primary"
                        style={{
                          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                          opacity: 0.3,
                        }}
                      />
                      <span className="text-3xl font-bold text-foreground">{repeatPercentage}%</span>
                    </div>
                    <p className="text-muted-foreground">of customers order again</p>
                    <p className="text-sm text-muted-foreground mt-1">{repeatCount} repeat customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </SellerLayout>
  );
}
