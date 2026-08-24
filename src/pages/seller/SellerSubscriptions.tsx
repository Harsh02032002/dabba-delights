import { SellerLayout } from '@/layouts/SellerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { OnlinePaymentModal } from '@/components/OnlinePaymentModal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useState } from 'react';
import { Users, Phone, MapPin, Calendar, IndianRupee, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

interface Subscription {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  plan_id: {
    _id: string;
    plan_name: string;
    total_amount: number;
    total_days: number;
  };
  total_amount: number;
  total_days: number;
  per_day_value: number;
  remaining_amount: number;
  remaining_days: number;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  last_used?: string;
}

export default function SellerSubscriptions() {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const [isOnlinePayOpen, setIsOnlinePayOpen] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<any>(null);

  const { data: subscriptions, isLoading, refetch } = useQuery({
    queryKey: ['seller-subscriptions'],
    queryFn: async () => {
      const res = await apiRequest('/seller/subscriptions');
      return res.subscriptions || res.data || [];
    },
  });

  const { data: sellerSubData, refetch: refetchSellerSub } = useQuery({
    queryKey: ['seller-own-subscription'],
    queryFn: async () => {
      const res = await apiRequest('/subscriptions/seller/active');
      return res;
    },
  });

  const { data: availablePlans } = useQuery({
    queryKey: ['seller-available-plans'],
    queryFn: async () => {
      const res = await apiRequest('/subscriptions/plans');
      return res.plans || [];
    },
  });

  const activeSubscriptions = subscriptions?.filter((s: Subscription) => s.status === 'active') || [];
  const expiredSubscriptions = subscriptions?.filter((s: Subscription) => s.status !== 'active') || [];

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsDialog(true);
  };

  if (isLoading) {
    return (
      <SellerLayout title="My Subscribers">
        <LoadingSpinner />
      </SellerLayout>
    );
  }

  return (
    <SellerLayout 
      title="My Subscribers & Subscriptions" 
      subtitle="Manage your subscriber customers and your restaurant platform subscription"
    >
      <div className="space-y-6">
        {/* Seller Own Subscription Banner */}
        <Card className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700 shadow-xl overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500 text-slate-950 font-bold uppercase tracking-wider text-xs">
                    Restaurant Platform Membership
                  </Badge>
                </div>
                <h3 className="text-2xl font-extrabold mt-2 text-white">
                  {sellerSubData?.subscriptions?.length ? sellerSubData.subscriptions[0].plan_id?.plan_name || 'Active Membership' : 'Activate Restaurant Subscription'}
                </h3>
                <p className="text-sm text-emerald-200 mt-1 max-w-xl">
                  {sellerSubData?.subscriptions?.length 
                    ? `Active until ${sellerSubData.subscriptions[0].remaining_days} days remaining. Benefits include priority order distribution and listing.`
                    : 'Subscribe your restaurant to access full features, receive customer meal subscriptions, and get priority visibility.'}
                </p>
              </div>
              <Button
                onClick={() => setIsSubscribeDialogOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                {sellerSubData?.subscriptions?.length ? 'Renew / Change Plan' : '➕ Add Subscription Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Subscribers</p>
                  <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Balance Available</p>
                  <p className="text-3xl font-bold">
                    ₹{activeSubscriptions.reduce((sum: number, s: Subscription) => sum + s.remaining_amount, 0).toFixed(0)}
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Days Available</p>
                  <p className="text-3xl font-bold">
                    {activeSubscriptions.reduce((sum: number, s: Subscription) => sum + s.remaining_days, 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Subscribers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Active Subscribers
              <Badge variant="secondary">{activeSubscriptions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active subscribers yet</p>
                <p className="text-sm">Users will appear here when they subscribe to your home chef plan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSubscriptions.map((sub: Subscription) => (
                  <div 
                    key={sub._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {sub.user_id?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{sub.user_id?.name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{sub.user_id?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {sub.plan_id?.plan_name}
                          </Badge>
                          <span className="text-xs text-green-600 font-medium">
                            ₹{sub.per_day_value.toFixed(0)}/day
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Remaining Balance</p>
                        <p className="text-xl font-bold text-green-600">₹{sub.remaining_amount.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Days Left</p>
                        <p className="text-xl font-bold">{sub.remaining_days}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(sub)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expired Subscriptions */}
        {expiredSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-500" />
                Expired/Cancelled Subscriptions
                <Badge variant="secondary">{expiredSubscriptions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-60">
                {expiredSubscriptions.map((sub: Subscription) => (
                  <div 
                    key={sub._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                        {sub.user_id?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{sub.user_id?.name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{sub.user_id?.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-gray-500">
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Subscriber Details</DialogTitle>
            </DialogHeader>
            {selectedSubscription && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedSubscription.user_id?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedSubscription.user_id?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.user_id?.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedSubscription.user_id?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedSubscription.user_id.phone}</span>
                    </div>
                  )}
                  {selectedSubscription.user_id?.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>
                        {selectedSubscription.user_id.address.street}, {selectedSubscription.user_id.address.city}, {selectedSubscription.user_id.address.state} - {selectedSubscription.user_id.address.pincode}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Subscription Info</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Plan</p>
                      <p className="font-medium">{selectedSubscription.plan_id?.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Per Day Value</p>
                      <p className="font-medium">₹{selectedSubscription.per_day_value.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining Balance</p>
                      <p className="font-medium text-green-600">₹{selectedSubscription.remaining_amount.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Left</p>
                      <p className="font-medium">{selectedSubscription.remaining_days}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Subscribed on {format(new Date(selectedSubscription.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                </div>

        {/* Subscribe Restaurant Plan Dialog */}
        <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Select Restaurant Subscription Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Choose a membership subscription plan for your restaurant to activate platform privileges.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(availablePlans || []).map((plan: any) => (
                  <Card 
                    key={plan._id} 
                    className={`border-2 cursor-pointer transition-all hover:border-emerald-500 ${selectedPlanToBuy?._id === plan._id ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-gray-200'}`}
                    onClick={() => setSelectedPlanToBuy(plan)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-base">{plan.plan_name}</h4>
                        {plan.badge && <Badge className="bg-emerald-600 text-white text-[10px]">{plan.badge}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
                      <div className="pt-2 flex justify-between items-baseline">
                        <span className="text-2xl font-extrabold text-emerald-600">₹{plan.total_amount}</span>
                        <span className="text-xs text-muted-foreground">{plan.total_days} Days validity</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanToBuy(plan);
                          setIsSubscribeDialogOpen(false);
                          setIsOnlinePayOpen(true);
                        }}
                      >
                        Subscribe & Pay Online
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {(!availablePlans || availablePlans.length === 0) && (
                  <div className="col-span-2 text-center py-8 border-2 border-dashed rounded-xl">
                    <p className="font-semibold text-gray-700">Standard Seller Membership Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">₹2,999 for 30 Days Full Access</p>
                    <Button
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        setSelectedPlanToBuy({ total_amount: 2999, total_days: 30, plan_name: 'Standard Restaurant Membership' });
                        setIsSubscribeDialogOpen(false);
                        setIsOnlinePayOpen(true);
                      }}
                    >
                      Subscribe ₹2,999 / 30 Days
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Online Payment Modal for Seller Subscription */}
        <OnlinePaymentModal
          isOpen={isOnlinePayOpen}
          onClose={() => setIsOnlinePayOpen(false)}
          amount={selectedPlanToBuy?.total_amount || 2999}
          title={`Activate ${selectedPlanToBuy?.plan_name || 'Restaurant Membership'}`}
          description="Scan the PhonePe QR code to complete your restaurant subscription payment online."
          onPaymentSuccess={async (txnId) => {
            try {
              await apiRequest('/subscriptions/seller/purchase', {
                method: 'POST',
                body: JSON.stringify({
                  planId: selectedPlanToBuy?._id,
                  totalAmount: selectedPlanToBuy?.total_amount || 2999,
                  totalDays: selectedPlanToBuy?.total_days || 30,
                  transactionId: txnId || `SELLER_UPI_${Date.now()}`
                })
              });
              toast({
                title: 'Subscription Activated! 🎉',
                description: 'Your restaurant membership subscription has been activated successfully.',
              });
              refetchSellerSub();
            } catch (err: any) {
              toast({
                title: 'Activation Error',
                description: err?.message || 'Failed to activate subscription',
                variant: 'destructive',
              });
            }
          }}
        />
      </div>
    </SellerLayout>
  );
}
