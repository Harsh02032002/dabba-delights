import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserLayout } from "@/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, paymentAPI } from "@/lib/api";
import { Loader2, Crown, CheckCircle, Clock, AlertCircle, Zap, Gift, Star, Store, Image as ImageIcon, Utensils, ChefHat, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

interface Seller {
  _id: string;
  businessName: string;
  type: string;
  logo?: string;
}

interface SubscriptionPlan {
  _id: string;
  plan_name: string;
  description?: string;
  total_amount: number;
  total_days: number;
  per_day_value: number;
  badge?: string;
  features?: string[];
  is_active: boolean;
  poster_image?: string;
  image?: string;
  banner_image?: string;
  assigned_seller_id?: {
    _id: string;
    businessName: string;
  };
}

interface ActiveSubscription {
  _id: string;
  plan_id?: { _id: string; plan_name: string; description?: string };
  seller_id?: { _id: string; businessName: string; type: string; logo?: string };
  total_amount: number;
  remaining_amount: number;
  total_days: number;
  remaining_days: number;
  per_day_value: number;
  status: "active" | "expired";
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionHistory {
  _id: string;
  plan_id?: { _id: string; plan_name: string };
  seller_id?: { _id: string; businessName: string; type: string };
  total_amount: number;
  remaining_amount: number;
  total_days: number;
  remaining_days: number;
  status: "active" | "expired";
  createdAt: string;
}

export default function UserSubscription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  const [showSellerDialog, setShowSellerDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchSellers();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "plans") {
        const plansRes = await apiRequest("/subscriptions/plans");
        setPlans(plansRes.plans || []);
      }

      const activeRes = await apiRequest("/subscriptions/active");
      setActiveSubscriptions(activeRes.subscriptions || (activeRes.subscription ? [activeRes.subscription] : []));

      if (activeTab === "history") {
        const historyRes = await apiRequest("/subscriptions/my-subscriptions");
        setHistory(historyRes.subscriptions || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    if (!user) return;

    try {
      const savedLoc = localStorage.getItem("userLocationCoords") || localStorage.getItem("user_location_coords");
      const savedName = localStorage.getItem("userLocationName") || localStorage.getItem("user_location_name");

      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if (parsed?.lat && parsed?.lng) {
            console.log(`📡 Fetching nearby sellers for coords:`, parsed, savedName);
            const queryParams = new URLSearchParams({
              lat: parsed.lat.toString(),
              lng: parsed.lng.toString(),
              radius: "50000",
            });
            if (savedName) queryParams.append("city", savedName);

            const nearbyRes = await apiRequest(`/user/sellers/nearby?${queryParams.toString()}`);
            if (nearbyRes?.success && Array.isArray(nearbyRes.sellers)) {
              console.log('🏠 Nearby sellers found:', nearbyRes.sellers.length);
              setSellers(nearbyRes.sellers);
              return;
            }
          }
        } catch (e) {
          console.error("Error parsing location in UserSubscription:", e);
        }
      }

      // Fallback if location is not set: Fetch all sellers
      console.log('📡 Fetching all sellers...');
      const res = await apiRequest("/user/sellers");
      const rawSellers = res.sellers || res.data || [];
      setSellers(rawSellers);
    } catch (error: any) {
      console.error("❌ Failed to fetch sellers:", error);
    }
  };

  const generatePlanPoster = (plan: SubscriptionPlan) => {
    // Create a canvas-based poster with dynamic data
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // White content area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.roundRect(20, 20, 360, 560, 20);
    ctx.fill();

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(plan.plan_name, 200, 80);

    // Badge
    if (plan.badge) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(plan.badge, 200, 110);
    }

    // Price
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`₹${plan.total_amount}`, 200, 160);

    // Duration
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial';
    ctx.fillText(`${plan.total_days} Days`, 200, 190);

    // Per day value
    ctx.fillStyle = '#9333ea';
    ctx.font = '20px Arial';
    ctx.fillText(`₹${plan.per_day_value.toFixed(2)}/day`, 200, 220);

    // Features
    if (plan.features && plan.features.length > 0) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Features:', 200, 260);

      ctx.font = '16px Arial';
      plan.features.slice(0, 4).forEach((feature, index) => {
        ctx.fillText(`• ${feature}`, 200, 290 + (index * 25));
      });
    }

    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Dabba Delights', 200, 550);

    return canvas.toDataURL('image/png');
  };

  const handleGeneratePoster = (plan: SubscriptionPlan) => {
    const posterUrl = generatePlanPoster(plan);
    if (posterUrl) {
      // Download the poster
      const link = document.createElement('a');
      link.download = `${plan.plan_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_poster.png`;
      link.href = posterUrl;
      link.click();

      toast({
        title: "Success",
        description: "Plan poster generated and downloaded successfully"
      });
    }
  };

  const handlePurchase = async (plan: SubscriptionPlan) => {
    setSelectedPlanId(plan._id);
    if (plan.assigned_seller_id?._id) {
      setSelectedSeller(plan.assigned_seller_id._id);
      proceedWithPurchase(plan, plan.assigned_seller_id._id);
    } else {
      setShowSellerDialog(true);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlanId || !selectedSeller) {
      toast({
        title: "Error",
        description: "Please select a home chef first",
        variant: "destructive"
      });
      return;
    }

    const plan = plans.find(p => p._id === selectedPlanId);
    if (!plan) return;

    // Close dialog and proceed with purchase
    setShowSellerDialog(false);
    proceedWithPurchase(plan, selectedSeller);
  };

  const proceedWithPurchase = async (plan: SubscriptionPlan, sellerId: string) => {
    setPurchasing(plan._id);

    try {
      console.log('🚀 Starting subscription purchase for plan:', plan.plan_name, 'with seller:', sellerId);

      // Create Razorpay order first
      const orderRes = await paymentAPI.createRazorpayOrder({
        amount: plan.total_amount,
      });

      if (!orderRes.orderId || !orderRes.key) {
        throw new Error("Failed to create payment order");
      }

      console.log('✅ Razorpay order created:', orderRes.orderId);

      // Razorpay options
      const options = {
        key: orderRes.key, // Use dynamic key from backend
        amount: plan.total_amount * 100, // Amount in paise
        currency: "INR",
        name: "Dabba Delights",
        description: `Subscription: ${plan.plan_name}`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          console.log('💳 Payment successful:', response);

          try {
            // Verify payment on backend
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            console.log('✅ Payment verification response:', verifyRes);

            if (verifyRes?.verified || verifyRes?.success) {
              console.log('✅ Payment verified, activating subscription...');
              console.log('📋 Plan data:', { planId: plan._id, totalAmount: plan.total_amount, totalDays: plan.total_days, sellerId });

              // NOTE: Backend validation requires plan to have assigned_seller_id
              // But user cannot update admin plans, so we need backend fix

              // Create subscription after successful payment
              const requestBody = {
                planId: plan._id,
                sellerId: sellerId, // Home chef ID
                assigned_seller_id: sellerId, // For backend compatibility
                totalAmount: plan.total_amount,
                totalDays: plan.total_days,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              };
              console.log('📤 API Request body:', requestBody);

              const subscriptionRes = await apiRequest('/subscriptions/purchase', {
                method: 'POST',
                body: JSON.stringify(requestBody),
              });

              console.log('📥 API Response:', subscriptionRes);

              if (subscriptionRes.success) {
                toast({
                  title: "🎉 Payment Successful!",
                  description: `Your subscription with home chef has been activated successfully.`,
                });

                // Force refresh data after successful subscription
                await fetchData();
                setActiveTab("active"); // Switch to active tab to show subscription
              } else {
                throw new Error("Failed to activate subscription");
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error: any) {
            console.error('❌ Payment verification error:', error);

            // Special handling for backend validation issue
            if (error.message === "Plan has no assigned seller") {
              toast({
                title: "⚠️ Subscription System Update",
                description: "Home chef subscriptions are being updated. Please try again in a few minutes or contact support.",
                variant: "destructive"
              });
            } else {
              toast({
                title: "Payment Verification Failed",
                description: error.message || "Please contact support.",
                variant: "destructive"
              });
            }
          } finally {
            setPurchasing(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#E86F2A"
        },
        modal: {
          ondismiss: function () {
            console.log('❌ Razorpay modal dismissed by user');
            setPurchasing(null);
          },
          backdropclose: true,
          escape: true,
          handleback: true
        },
        notes: {
          plan_id: plan._id,
          plan_name: plan.plan_name,
          user_id: user?._id
        }
      };

      console.log('🔧 Razorpay options created:', options);

      // Load Razorpay script fresh
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        console.log('✅ Razorpay script loaded fresh');

        try {
          // Create Razorpay instance directly from global window
          const rzp = new (window as any).Razorpay(options);
          console.log('✅ Razorpay instance created fresh');

          // Open the modal
          rzp.open();
          console.log('🚀 Razorpay modal opened');

        } catch (err: any) {
          console.error('❌ Error creating Razorpay instance:', err);
          toast({
            title: "Payment Error",
            description: "Cannot open payment modal. Please try again.",
            variant: "destructive"
          });
          setPurchasing(null);
        }
      };

      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        toast({
          title: "Network Error",
          description: "Cannot load payment gateway. Please check your connection.",
          variant: "destructive"
        });
        setPurchasing(null);
      };

      document.body.appendChild(script);

    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to process purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getProgressPercentage = (sub: ActiveSubscription) => {
    const used = sub.total_amount - sub.remaining_amount;
    return Math.round((used / sub.total_amount) * 100);
  };

  const getDaysProgressPercentage = (sub: ActiveSubscription) => {
    const used = sub.total_days - sub.remaining_days;
    return Math.round((used / sub.total_days) * 100);
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="w-8 h-8 text-orange-500" />
              Dabba Nation Subscription
            </h1>
            <p className="text-muted-foreground mt-1">
              Save more with our subscription plans!
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="my-plan">My Plan</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No subscription plans available at the moment.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan._id}
                    className={`relative overflow-hidden ${plan.badge ? "border-2 border-orange-500" : ""
                      }`}
                  >
                    {plan.badge && (
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        {plan.badge}
                      </div>
                    )}

                    {/* Food Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                      {(() => {
                        const planImage = plan.banner_image || plan.image;
                        const duration = plan.total_days || 0;
                        
                        // Determine fallback images based on duration
                        let localFallback = "/images/weekly_plan.png";
                        if (duration > 14) localFallback = "/images/monthly_plan.png";
                        else if (duration > 7) localFallback = "/images/fortnightly_plan.png";
                        
                        let src = "";
                        if (planImage) {
                          if (planImage.startsWith('http')) {
                            src = planImage;
                          } else {
                            // Prepend base URL
                            const baseUrl = "https://dabbanation.in";
                            src = `${baseUrl}${planImage.startsWith('/') ? '' : '/'}${planImage}`;
                          }
                        } else {
                          src = localFallback;
                        }

                        return (
                          <img 
                            src={src} 
                            alt={plan.plan_name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== window.location.origin + localFallback) {
                                target.src = localFallback;
                              }
                            }}
                          />
                        );
                      })()}
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          )}
                        </div>

                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 p-4">
                      <div className="text-center py-2">
                        <span className="text-3xl font-bold">₹{plan.total_amount}</span>
                        <span className="text-muted-foreground text-sm"> / {plan.total_days} days</span>
                        <p className="text-sm text-green-600 mt-1">
                          ₹{plan.per_day_value.toFixed(2)} per day
                        </p>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-1">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Daily Menu Info */}
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Utensils className="w-3 h-3" />
                        <span>Daily menu items included</span>
                      </div>

                      {/* Seller Info */}
                      {plan.assigned_seller_id?.businessName && (
                        <div className="mt-2 p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {plan.assigned_seller_id.businessName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{plan.assigned_seller_id.businessName}</p>
                            <p className="text-[10px] text-orange-700 font-medium capitalize">
                              Exclusive Plan by {plan.assigned_seller_id.type === 'restaurant' ? 'Restaurant' : 'Home Chef'}
                            </p>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(plan)}
                        disabled={purchasing === plan._id || !plan.is_active}
                      >
                        {purchasing === plan._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Purchase Plan
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Plan Tab */}
          <TabsContent value="my-plan" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : activeSubscriptions.length > 0 ? (
              <div className="space-y-6">
                {activeSubscriptions.map((sub) => (
                  <Card key={sub._id} className="border-2 border-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-6 h-6 text-green-500" />
                          <CardTitle>Active Subscription</CardTitle>
                        </div>
                        <Badge className="bg-green-500">ACTIVE</Badge>
                      </div>
                      {sub.seller_id && (
                        <div className="flex items-center gap-2 mt-2">
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            For {sub.seller_id.businessName}
                            {sub.seller_id.type && (
                              <span className="capitalize"> ({sub.seller_id.type.replace('_', ' ')})</span>
                            )}
                          </p>
                        </div>
                      )}
                      {sub.plan_id && (
                        <p className="text-muted-foreground mt-1">
                          {sub.plan_id.plan_name}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Balance Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Remaining Balance</span>
                          <span className="font-semibold">
                            ₹{sub.remaining_amount.toFixed(2)} / ₹
                            {sub.total_amount}
                          </span>
                        </div>
                        <Progress value={100 - getProgressPercentage(sub)} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          ₹
                          {(
                            sub.total_amount - sub.remaining_amount
                          ).toFixed(2)}{" "}
                          used
                        </p>
                      </div>

                      {/* Days Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Remaining Days</span>
                          <span className="font-semibold">
                            {sub.remaining_days} / {sub.total_days} days
                          </span>
                        </div>
                        <Progress value={100 - getDaysProgressPercentage(sub)} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {sub.total_days - sub.remaining_days} days
                          used
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-orange-500">
                            ₹{sub.per_day_value.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Per Day Value</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-green-500">
                            {sub.remaining_days}
                          </p>
                          <p className="text-xs text-muted-foreground">Days Left</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-blue-500">
                            ₹{sub.remaining_amount.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Balance Left</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-purple-500">
                            {getDaysProgressPercentage(sub)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Used</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                        <Clock className="w-4 h-4" />
                        <span>
                          Activated on{" "}
                          {format(new Date(sub.createdAt), "MMMM d, yyyy")}
                        </span>
                      </div>

                      {/* Order Now Button */}
                      {sub.seller_id && sub.remaining_amount > 0 && (
                        <div className="pt-4 border-t space-y-2">
                          <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                            onClick={() => navigate(`/subscription-items`)}
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            View My Subscription Items
                            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
                              ₹{sub.remaining_amount.toFixed(0)} available
                            </span>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {/* Benefits Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Your Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Hybrid Payment</p>
                          <p className="text-sm text-muted-foreground">
                            Use subscription + online payment for orders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Priority Support</p>
                          <p className="text-sm text-muted-foreground">
                            Get faster customer support
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Auto-Deduct</p>
                          <p className="text-sm text-muted-foreground">
                            Automatic subscription usage on orders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Crown className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">Special Offers</p>
                          <p className="text-sm text-muted-foreground">
                            Exclusive deals for subscribers
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have an active subscription. Purchase a plan to start saving!
                  </p>
                  <Button onClick={() => setActiveTab("plans")}>View Plans</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No subscription history found.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((sub) => (
                  <Card key={sub._id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {sub.plan_id?.plan_name || "Custom Plan"}
                          </p>
                          {sub.seller_id && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              {sub.seller_id.businessName}
                              {sub.seller_id.type && (
                                <span className="capitalize"> ({sub.seller_id.type.replace('_', ' ')})</span>
                              )}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(sub.createdAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-semibold">₹{sub.total_amount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Used</p>
                            <p className="font-semibold">
                              ₹{(sub.total_amount - sub.remaining_amount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days</p>
                            <p className="font-semibold">
                              {sub.total_days - sub.remaining_days} / {sub.total_days}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            sub.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }
                        >
                          {sub.status === "active" ? "Active" : "Expired"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Seller Selection Dialog */}
        {(() => {
          const currentPlan = plans.find(p => p._id === selectedPlanId);
          const currentPlanType = currentPlan?.plan_type || currentPlan?.target_type || 'home_chef';
          const isRestaurant = currentPlanType === 'restaurant';
          const isCloudKitchen = currentPlanType === 'cloud_kitchen' || currentPlanType === 'all' || currentPlanType === 'seller';
          
          const availableSellers = sellers.filter(s => {
            if (isCloudKitchen) return true; // Both Home Chefs and Restaurants!
            if (isRestaurant) return s.type === 'restaurant';
            return s.type === 'home-chef' || s.type === 'home_chef';
          });

          const dialogTitle = isCloudKitchen ? 'Select Seller (Home Chef / Restaurant)' : isRestaurant ? 'Select Restaurant' : 'Select Home Chef';
          const dialogTargetName = isCloudKitchen ? 'seller' : isRestaurant ? 'restaurant' : 'home chef';

          return (
            <Dialog open={showSellerDialog} onOpenChange={setShowSellerDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                  <DialogDescription>
                    Choose which {dialogTargetName} you want this subscription for. Your payment will go to admin first, then admin will pay the seller.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 max-h-[400px] overflow-y-auto py-4">
                  {availableSellers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No {dialogTargetName}s available at this location
                    </p>
                  ) : (
                    availableSellers.map((seller) => {
                      const initials = seller.businessName
                        .split(' ')
                        .map((w: string) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                      return (
                      <div
                        key={seller._id}
                        onClick={() => setSelectedSeller(seller._id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedSeller === seller._id
                            ? "border-green-500 bg-green-50"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt={seller.businessName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span style="font-size:14px;font-weight:700;color:#E86F2A;">${initials}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-orange-500">{initials}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{seller.businessName}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {seller.type === 'restaurant' ? 'Restaurant' : 'Home Chef'}
                          </p>
                        </div>
                        {selectedSeller === seller._id && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      );
                    })
                  )}
                </div>
          );
        })()}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSellerDialog(false);
                  setSelectedSeller("");
                  setSelectedPlanId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!selectedSeller}
                onClick={handleConfirmPurchase}
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}
