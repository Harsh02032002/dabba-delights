import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, DollarSign, 
  Users, Package, CreditCard, Building2, CheckCircle, AlertCircle,
  Download, Send
} from 'lucide-react';
import { safeArray } from '@/utils/safeArray';
import { useToast } from '@/hooks/use-toast';

export default function AdminWallet() {
  const [period, setPeriod] = useState('all');

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [processingPayout, setProcessingPayout] = useState<string | null>(null);
  const [processingBulkPayout, setProcessingBulkPayout] = useState(false);

  // Fetch admin wallet stats (NEW WALLET SYSTEM)
  const { data: walletStats, isLoading, refetch } = useQuery({
    queryKey: ['admin-wallet-stats'],
    queryFn: async () => {
      const res = await apiRequest('/wallet/admin/stats');
      return res;
    },
  });

  // Fetch financial reports
  const { data: financialData } = useQuery({
    queryKey: ['admin-financial-reports'],
    queryFn: async () => {
      const res = await apiRequest('/wallet/admin/reports');
      return res;
    },
  });

  const stats = walletStats?.stats || {};
  const wallet = walletStats?.wallet;
  const sellerWallets = safeArray(walletStats?.sellerWallets);
  const recentTransactions = safeArray(walletStats?.recentTransactions);
  const userPayments = safeArray(walletStats?.user_payments);

  // 4 Main Stats from API
  const totalReceived = stats.total_received || 0;
  const totalToPaySellers = stats.total_to_pay_sellers || 0;
  const adminCommissionEarned = stats.admin_commission_earned || 0;
  const alreadyPaidToSellers = stats.already_paid_to_sellers || 0;
  
  // Additional stats
  const fromOrders = stats.from_orders || 0;
  const fromSubscriptions = stats.from_subscriptions || 0;
  const totalOrders = stats.total_orders || 0;
  const totalSubscriptions = stats.total_subscriptions || 0;
  const commissionRate = stats.commission_rate || 15;

  // Payout handler
  const handlePayout = async (sellerId: string, amount: number) => {
    try {
      setProcessingPayout(sellerId);
      const res = await apiRequest('/wallet/admin/payout', {
        method: 'POST',
        body: JSON.stringify({ sellerId, amount, notes: 'Manual payout' })
      });
      
      if (res.success) {
        toast({
          title: '✅ Payout Successful',
          description: `₹${amount} transferred to seller`
        });
        refetch();
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast({
        title: '❌ Payout Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessingPayout(null);
    }
  };

  // Bulk payout handler
  const handleBulkPayout = async () => {
    try {
      setProcessingBulkPayout(true);
      const res = await apiRequest('/wallet/admin/bulk-payout', {
        method: 'POST',
        body: JSON.stringify({ notes: 'Bulk payout to all sellers' })
      });
      
      if (res.success) {
        toast({
          title: '✅ Bulk Payout Initiated',
          description: `${res.results?.successful} payouts successful, ${res.results?.failed} failed. Total: ₹${res.total_amount?.toLocaleString()}`
        });
        refetch();
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast({
        title: '❌ Bulk Payout Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setProcessingBulkPayout(false);
    }
  };

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
          {/* 4 Main Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">💰 Total Received</p>
                <p className="text-2xl font-bold text-success">₹{totalReceived.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Orders: ₹{fromOrders.toLocaleString()} | Subs: ₹{fromSubscriptions.toLocaleString()}
                </p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Wallet size={24} className="text-success" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">📝 To Pay Sellers</p>
                <p className="text-2xl font-bold text-orange-600">₹{totalToPaySellers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending payouts to {sellerWallets.filter((s: any) => s.pending_payout > 0).length} sellers
                </p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <ArrowUpRight size={24} className="text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">📊 Admin Commission</p>
                <p className="text-2xl font-bold text-blue-600">₹{adminCommissionEarned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Rate: {commissionRate}% | Platform earnings
                </p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DollarSign size={24} className="text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="stat-card border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">✅ Already Paid</p>
                <p className="text-2xl font-bold text-purple-600">₹{alreadyPaidToSellers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Transferred to sellers
                </p>
                <div className="mt-2 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <CheckCircle size={24} className="text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Stats */}
          {wallet?.stats && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-xl font-bold">{wallet.stats.total_orders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subscriptions</p>
                      <p className="text-xl font-bold">{wallet.stats.total_subscriptions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Commission Earned</p>
                      <p className="text-xl font-bold">₹{wallet.stats.total_commission_earned?.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Building2 size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sellers Pending</p>
                      <p className="text-xl font-bold">{sellerWallets.filter((s: any) => s.pending_payout > 0).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Payments List - Who paid what */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Users size={20} />
                User Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {userPayments.length > 0 ? (
                  userPayments.map((up: any) => (
                    <div key={up.user?._id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {up.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{up.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{up.user?.phone || up.user?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{up.total_paid?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Paid</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        {up.from_orders > 0 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <Package size={12} className="mr-1" />
                            Orders: ₹{up.from_orders?.toLocaleString()} ({up.orders?.length} orders)
                          </Badge>
                        )}
                        {up.from_subscriptions > 0 && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <CreditCard size={12} className="mr-1" />
                            Subscriptions: ₹{up.from_subscriptions?.toLocaleString()} ({up.subscriptions?.length} subs)
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No user payments yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seller Payouts Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Building2 size={20} />
                  Seller Payouts
                </CardTitle>
                {sellerWallets.filter((s: any) => s.pending_payout > 0).length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkPayout}
                    disabled={processingBulkPayout}
                  >
                    {processingBulkPayout ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send size={14} className="mr-1" />
                        Bulk Pay All (₹{totalToPaySellers.toLocaleString()})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {sellerWallets.length > 0 ? (
                  sellerWallets.map((sw: any) => (
                    <div key={sw.seller_id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{sw.seller_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {sw.seller_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>💰 Total: ₹{sw.total_earnings?.toLocaleString()}</span>
                          <span>✅ Paid: ₹{sw.paid_out?.toLocaleString()}</span>
                          {sw.bank_details?.accountNumber && (
                            <span>🏦 {sw.bank_details.accountNumber.slice(-4)} | {sw.bank_details.ifscCode}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-orange-600">₹{sw.pending_payout?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        {sw.pending_payout > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handlePayout(sw.seller_id, sw.pending_payout)}
                            disabled={processingPayout === sw.seller_id}
                          >
                            {processingPayout === sw.seller_id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Send size={14} className="mr-1" />
                                Pay
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No seller wallets found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((txn: any) => (
                    <div key={txn._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{txn.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {txn.type?.replace('_', ' ')}
                          </Badge>
                          {txn.seller_id?.businessName && (
                            <>
                              <span>•</span>
                              <span>{txn.seller_id.businessName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                          {txn.amount > 0 ? '+' : '-'}₹{Math.abs(txn.amount)?.toLocaleString()}
                        </span>
                        {txn.admin_commission > 0 && (
                          <p className="text-xs text-muted-foreground">Commission: ₹{txn.admin_commission}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
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
