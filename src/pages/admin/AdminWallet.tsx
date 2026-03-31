import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI, apiRequest } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function AdminWallet() {
  const [period, setPeriod] = useState('all');

  // Fetch admin wallet transactions
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['admin-wallet', period],
    queryFn: async () => {
      const res = await apiRequest('/user/wallet/transactions');
      return res?.data || res || {};
    },
  });

  // Fetch platform commission stats
  const { data: commissionData } = useQuery({
    queryKey: ['admin-commission-stats'],
    queryFn: () => adminAPI.getCommissionConfig(),
  });

  const walletBalance = Number(walletData?.balance || 0);
  const transactions = safeArray(walletData?.transactions);

  // Calculate stats
  const totalCredits = transactions
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalDebits = transactions
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const filteredTransactions = period === 'all'
    ? transactions
    : transactions.filter((t: any) => {
        const date = new Date(t.createdAt);
        const now = new Date();
        if (period === 'today') {
          return date.toDateString() === now.toDateString();
        } else if (period === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        } else if (period === 'month') {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        return true;
      });

  return (
    <AdminLayout title="Admin Wallet" subtitle="Platform earnings and commission management">
      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-card">All Time</TabsTrigger>
          <TabsTrigger value="today" className="data-[state=active]:bg-card">Today</TabsTrigger>
          <TabsTrigger value="week" className="data-[state=active]:bg-card">This Week</TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-card">This Month</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-success">₹{walletBalance.toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Wallet size={24} className="text-success" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                <p className="text-3xl font-bold text-foreground">₹{totalCredits.toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <ArrowDownLeft size={24} className="text-primary-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Total Debits</p>
                <p className="text-3xl font-bold text-destructive">₹{totalDebits.toLocaleString()}</p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <ArrowUpRight size={24} className="text-destructive" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-1">Platform Commission</p>
                <p className="text-3xl font-bold text-primary">{(commissionData?.defaultRate || 15)}%</p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign size={24} className="text-primary" />
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
                  <p className="font-medium text-foreground mb-1">How platform earnings work</p>
                  <p>When an order is delivered → Platform commission ({commissionData?.defaultRate || 15}%) is automatically credited to this wallet → Platform fee (₹{commissionData?.platformFee || 5}) is also added → Delivery charges go to rider's wallet → Seller gets net amount after deductions.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Wallet Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((txn: any) => (
                  <div key={txn._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{txn.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className="capitalize">{txn.referenceType}</span>
                        {txn.orderId && (
                          <>
                            <span>•</span>
                            <span>Order: #{txn.orderId.toString().slice(-6)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${txn.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">Bal: ₹{txn.balance?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <Wallet size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No transactions yet. Platform earnings will appear here after orders are delivered.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
