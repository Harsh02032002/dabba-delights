import React, { useState } from "react";
import { UserLayout } from "@/layouts/UserLayout";
import { userAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  ChefHat, 
  Clock, 
  MapPin, 
  Star, 
  CheckCircle, 
  Crown, 
  TrendingUp, 
  Store, 
  Calendar,
  IndianRupee,
  Utensils,
  Users,
  Package
} from "lucide-react";

// Load Razorpay SDK dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [searchParams] = useSearchParams();
  const urlPlanId = searchParams.get("planId");

  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      try {
        const res: any = await userAPI.getSubscriptionPlans();
        return res?.plans || res || [];
      } catch {
        return [];
      }
    },
  });

  // Auto-select plan from URL
  useEffect(() => {
    if (urlPlanId && plans.length > 0 && !hasAutoSelected) {
      const plan = plans.find((p: any) => p._id === urlPlanId);
      if (plan) {
        setSelectedPlan(plan);
        setHasAutoSelected(true);
      }
    }
  }, [urlPlanId, plans, hasAutoSelected]);

  // Handle subscription purchase with Razorpay
  const handleSubscribe = async (plan: any) => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: "Payment Error",
          description: "Could not load payment gateway. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create order on backend
      const orderRes: any = await userAPI.purchaseSubscription(
        plan.total_amount,
        plan.total_days
      );
      
      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || "Failed to create payment order");
      }

      const order = orderRes.order;
      
      // Razorpay options
      const options = {
        key: "rzp_test_1234567890", // Replace with your actual key
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Dabba Delights",
        description: `Subscription: ${plan.plan_name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyRes: any = await userAPI.verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: plan._id,
            });
            
            if (verifyRes.success) {
              toast({
                title: "Subscription Successful!",
                description: `You are now subscribed to ${plan.plan_name}`,
              });
              setSelectedPlan(null);
            } else {
              throw new Error(verifyRes.message || "Payment verification failed");
            }
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: (window as any).user?.name || "",
          email: (window as any).user?.email || "",
          contact: (window as any).user?.phone || "",
        },
        theme: {
          color: "#E86F2A"
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
          },
          backdropclose: true,
          escape: true,
        }
      };

      // Create and open Razorpay
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      razorpay.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive",
        });
      });

    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.response?.data?.message || error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  if (plansLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Meal Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our curated subscription plans and enjoy delicious meals every day
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan: any) => {
            const perDayPrice = Math.round(plan.total_amount / plan.total_days);
            const isPopular = plan.badge === 'POPULAR' || plan.badge === 'BEST VALUE';
            
            return (
              <Card 
                key={plan._id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isPopular ? 'border-2 border-blue-500 shadow-lg' : ''
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-sm font-semibold">
                      {plan.badge}
                    </Badge>
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
                        // Prepend base URL (removing /api from the end if present)
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
                  
                  {/* Overlay with plan name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <h3 className="text-white text-xl font-bold">{plan.plan_name}</h3>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Price and Duration */}
                  <div className="text-center mb-3">
                    <div className="flex items-baseline justify-center gap-2">
                      <IndianRupee className="w-5 h-5 text-green-600" />
                      <span className="text-3xl font-bold text-gray-900">{plan.total_amount}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      for {plan.total_days} days
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      <IndianRupee className="w-3 h-3" />
                      {perDayPrice} per day
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{plan.total_days} Days Validity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{plan.features || 'Daily Meals Included'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">
                        {plan.assigned_seller_id?.businessName || 'Dabba Delights'}
                      </span>
                    </div>
                  </div>

                  {/* Food Items Preview */}
                  {Array.isArray(plan.allowed_items) && plan.allowed_items.length > 0 || (Array.isArray(plan.allowed_items_data) && plan.allowed_items_data.length > 0) ? (
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 mb-1 flex items-center gap-1 text-xs">
                        <Utensils className="w-3 h-3" />
                        What You'll Get
                      </h4>
                      <div className="space-y-1">
                        {/* Database Items */}
                        {Array.isArray(plan.allowed_items) && plan.allowed_items.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {plan.allowed_items.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-1 bg-orange-50 rounded p-1 border border-orange-200 text-xs">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-4 h-4 rounded object-cover"
                                  />
                                ) : (
                                  <Utensils className="w-3 h-3 text-orange-500" />
                                )}
                                <span className="text-gray-700 font-medium">{item.name || 'Food Item'}</span>
                              </div>
                            ))}
                            {plan.allowed_items.length > 2 && (
                              <div className="flex items-center gap-1 bg-gray-100 rounded px-1 py-1">
                                <span className="text-xs text-gray-600">
                                  +{plan.allowed_items.length - 2} more
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Custom Items */}
                        {Array.isArray(plan.allowed_items_data) && plan.allowed_items_data.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {plan.allowed_items_data.slice(0, 2).map((item: any, index: number) => (
                              <div key={index} className="flex items-center gap-1 bg-green-50 rounded p-1 border border-green-200 text-xs">
                                <Utensils className="w-3 h-3 text-green-500" />
                                <span className="text-gray-700 font-medium">{item.name || 'Custom Item'}</span>
                                {item.price && (
                                  <span className="text-xs text-green-600">₹{item.price}</span>
                                )}
                              </div>
                            ))}
                            {plan.allowed_items_data.length > 2 && (
                              <div className="flex items-center gap-1 bg-gray-100 rounded px-1 py-1">
                                <span className="text-xs text-gray-600">
                                  +{plan.allowed_items_data.length - 2} more
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Utensils className="w-3 h-3" />
                        <span>Daily menu items included</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={() => handleSubscribe(plan)}
                      className="w-full bg-[#e12d2d] hover:bg-[#c02424] text-white font-bold py-4 rounded-lg shadow-md transition-all uppercase tracking-wider"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Purchase Plan
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Subscription Plans Available
              </h3>
              <p className="text-gray-600">
                Check back later for amazing subscription plans!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPlan.plan_name}
                </h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              {/* Plan Image */}
              {selectedPlan.poster_bg_image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={selectedPlan.poster_bg_image} 
                    alt={selectedPlan.plan_name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Plan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Plan Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">₹{selectedPlan.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedPlan.total_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per Day:</span>
                      <span className="font-medium text-green-600">
                        ₹{Math.round(selectedPlan.total_amount / selectedPlan.total_days)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seller:</span>
                      <span className="font-medium">{selectedPlan.seller_name || 'Dabba Delights'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{selectedPlan.features || 'Daily Meals'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Quality Ingredients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Hygienic Preparation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Items */}
              {selectedPlan.selected_products && selectedPlan.selected_products.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Included Food Items</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPlan.selected_products.map((product: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              <Button 
                onClick={() => handleSubscribe(selectedPlan)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
              >
                Subscribe Now - ₹{selectedPlan.total_amount}
              </Button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
