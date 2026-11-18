import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sellerAPI, apiRequest } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { DollarSign, TrendingUp, Percent, Wallet } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { safeArray } from '@/utils/safeArray';

export default function SellerEarnings() {
  const [period, setPeriod] = useState('monthly');

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['seller-earnings', period],
    queryFn: () => sellerAPI.getEarnings(period),
  });

  // Earned balance waiting to be paid out (same source as the My Wallet page)
  const { data: walletData } = useQuery({
    queryKey: ['seller-wallet-earned'],
    queryFn: async () => {
      const res = await apiRequest('/wallet/seller/my-wallet');
      return res?.wallet || res?.data || res || {};
    },
  });

  const e = earnings as any;
  const walletBalance = Number(walletData?.pending_payout || 0);

  return (
    <SellerLayout title="Earnings" subtitle="Track your revenue, commission, and payouts">
      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-card">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-card">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Available to Withdraw</p>
                <p className="text-3xl font-bold text-success">₹{walletBalance.toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Wallet size={24} className="text-success" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">₹{(e?.totalRevenue ?? 0).toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <DollarSign size={24} className="text-primary-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Commission Paid</p>
                <p className="text-3xl font-bold text-foreground">₹{(e?.totalCommission ?? 0).toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Percent size={24} className="text-destructive" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Net Earnings</p>
                <p className="text-3xl font-bold text-primary">₹{(e?.netEarnings ?? 0).toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it works info */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Wallet size={20} className="text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">How payouts work</p>
                  <p>When an order is delivered, its food value minus {e?.commissionRate ?? 15}% commission is added to your wallet automatically. Request a payout from the Wallet page and the admin transfers it to your bank.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Earnings Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeArray(e?.dailyEarnings)}>
                      <defs>
                        <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(145, 60%, 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(v: number) => [`₹${v}`, 'Earnings']} />
                      <Area type="monotone" dataKey="earnings" stroke="hsl(145, 60%, 45%)" strokeWidth={2} fill="url(#earnGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Daily Revenue</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeArray(e?.dailyEarnings)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(30, 20%, 90%)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="hsl(16, 85%, 55%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Transactions */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Wallet Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safeArray(walletData?.transactions).map((txn: any) => (
                  <div key={txn._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div>
                      <p className="font-medium text-foreground">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString()} • {txn.referenceType}</p>
                    </div>
                    <span className={`font-bold ${txn.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
                {safeArray(walletData?.transactions).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No transactions yet. Earnings will appear here after settlements are processed.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </SellerLayout>
  );
}
