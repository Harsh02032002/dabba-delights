import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Wallet, TrendingUp, Package, CreditCard, Users, 
  ArrowDownLeft, Clock, CheckCircle
} from 'lucide-react';
import { safeArray } from '@/utils/safeArray';

export default function SellerWallet() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch seller's wallet from new wallet system
  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['seller-wallet-new'],
    queryFn: async () => {
      const res = await apiRequest('/wallet/seller/my-wallet');
      return res;
    },
  });

  const wallet = walletData?.wallet;
  const transactions = safeArray(walletData?.transactions);
  const stats = walletData?.stats || {};

  // Calculate earnings by type
  const totalEarnings = wallet?.total_earnings || 0;
  const pendingPayout = wallet?.pending_payout || 0;
  const paidOut = wallet?.paid_out || 0;
  const fromOrders = stats.from_orders || 0;
  const fromSubscriptions = stats.from_subscriptions || 0;
  const totalOrders = stats.total_orders || 0;
  const totalSubscriptions = stats.total_subscriptions || 0;

  return (
    <SellerLayout title="My Wallet" subtitle="Track your earnings from orders and subscriptions">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-card">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-card">Orders</TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-card">Subscriptions</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? <LoadingSpinner /> : (
        <>
          {/* 3 Main Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="stat-card border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">💰 Total Earnings</p>
                <p className="text-3xl font-bold text-success">₹{totalEarnings.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Package size={10} className="mr-1" />
                    Orders: ₹{fromOrders.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <CreditCard size={10} className="mr-1" />
                    Subs: ₹{fromSubscriptions.toLocaleString()}
                  </Badge>
                </div>
                <div className="mt-3 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Wallet size={24} className="text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">⏳ Pending Payout</p>
                <p className="text-3xl font-bold text-orange-600">₹{pendingPayout.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Will be transferred to your bank account
                </p>
                <div className="mt-3 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock size={24} className="text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">✅ Already Paid</p>
                <p className="text-3xl font-bold text-blue-600">₹{paidOut.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Transferred to your bank account
                </p>
                <div className="mt-3 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CheckCircle size={24} className="text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats by Type */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-xl font-bold">{totalOrders}</p>
                    <p className="text-xs text-muted-foreground">₹{fromOrders.toLocaleString()} earned</p>
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
                    <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                    <p className="text-xl font-bold">{totalSubscriptions}</p>
                    <p className="text-xs text-muted-foreground">₹{fromSubscriptions.toLocaleString()} earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <ArrowDownLeft size={20} />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {transactions.length > 0 ? (
                    transactions.map((txn: any) => (
                      <div key={txn._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{txn.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(txn.createdAt).toLocaleDateString('en-IN')}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {txn.type?.replace('_', ' ')}
                            </Badge>
                            {txn.order_id && (
                              <>
                                <span>•</span>
                                <span>Order #{txn.order_id.toString().slice(-6)}</span>
                              </>
                            )}
                            {txn.subscription_id && (
                              <>
                                <span>•</span>
                                <span>Subscription</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${txn.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                            {txn.amount > 0 ? '+' : '-'}₹{Math.abs(txn.amount)?.toLocaleString()}
                          </span>
                          {txn.seller_amount > 0 && (
                            <p className="text-xs text-muted-foreground">Your share: ₹{txn.seller_amount}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Wallet size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No transactions yet. Earnings will appear here after orders are delivered.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {transactions.filter((t: any) => t.type === 'order_payment').length > 0 ? (
                    transactions
                      .filter((t: any) => t.type === 'order_payment')
                      .map((txn: any) => (
                        <div key={txn._id} className="p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">Order #{txn.order_id?.toString().slice(-6)}</p>
                              <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-success">+₹{txn.seller_amount?.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Your earning</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted-foreground">Total: ₹{txn.amount?.toLocaleString()}</span>
                            <span className="text-muted-foreground">Commission: ₹{txn.admin_commission?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <Package size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No order earnings yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subscriptions" className="mt-0">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {transactions.filter((t: any) => t.type === 'subscription_payment').length > 0 ? (
                    transactions
                      .filter((t: any) => t.type === 'subscription_payment')
                      .map((txn: any) => (
                        <div key={txn._id} className="p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{txn.metadata?.subscription_plan || 'Subscription'}</p>
                              <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-success">+₹{txn.seller_amount?.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Your earning</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-muted-foreground">Total: ₹{txn.amount?.toLocaleString()}</span>
                            <span className="text-muted-foreground">Commission: ₹{txn.admin_commission?.toLocaleString()}</span>
                          </div>
                          {txn.user_id && (
                            <p className="text-xs text-muted-foreground mt-1">
                              From: {txn.user_id.name || txn.user_id.phone}
                            </p>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No subscription earnings yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Card>

          {/* Customer List - Who paid you */}
          {walletData?.user_payments?.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Users size={20} />
                  Your Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {walletData.user_payments.map((up: any) => (
                    <div key={up.user?._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {up.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{up.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{up.user?.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{up.total_paid?.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-xs">
                          {up.orders?.length > 0 && (
                            <span className="text-blue-600">{up.orders.length} orders</span>
                          )}
                          {up.subscriptions?.length > 0 && (
                            <span className="text-purple-600">{up.subscriptions.length} subs</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </SellerLayout>
  );
}
