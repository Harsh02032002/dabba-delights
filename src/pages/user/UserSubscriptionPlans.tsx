import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Crown, Clock, CheckCircle, ChevronRight, Loader2, ChefHat, ArrowLeft } from "lucide-react";
import { UserLayout } from "@/layouts/UserLayout";

interface SubscriptionPlan {
  _id: string;
  plan_name: string;
  description?: string;
  total_amount: number;
  total_days: number;
  per_day_value: number;
  banner_image?: string;
  badge?: string;
  features?: string[];
}

interface HomeChef {
  _id: string;
  businessName: string;
  type: string;
  address?: {
    city?: string;
  };
  image?: string;
}

export default function UserSubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [homeChefs, setHomeChefs] = useState<HomeChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedChef, setSelectedChef] = useState<HomeChef | null>(null);
  const [step, setStep] = useState<"plans" | "chefs" | "confirm">("plans");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchHomeChefs();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiRequest("/subscriptions/plans?active=true");
      if (res.success) {
        setPlans(res.plans || []);
      }
    } catch (err: any) {
      toast.error("Failed to load subscription plans");
    }
  };

  const fetchHomeChefs = async () => {
    try {
      const savedLoc = localStorage.getItem("user_location_coords");
      let chefs: any[] = [];
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if (parsed?.lat && parsed?.lng) {
            const res = await apiRequest(`/user/sellers/nearby?lat=${parsed.lat}&lng=${parsed.lng}&radius=20000&type=home_chef`);
            if (res?.success && Array.isArray(res.sellers) && res.sellers.length > 0) {
              chefs = res.sellers;
            }
          }
        } catch (e) {
          console.error("Error parsing user location for subscription plans:", e);
        }
      }

      if (chefs.length === 0) {
        const res = await apiRequest("/sellers?type=home_chef&active=true");
        if (res?.success) {
          chefs = res.sellers || [];
        }
      }
      setHomeChefs(chefs);
    } catch (err: any) {
      toast.error("Failed to load home chefs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep("chefs");
  };

  const handleSelectChef = (chef: HomeChef) => {
    setSelectedChef(chef);
    setStep("confirm");
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedChef) return;
    
    try {
      setSubscribing(true);
      const res = await apiRequest("/subscriptions/purchase", {
        method: "POST",
        body: JSON.stringify({
          plan_id: selectedPlan._id,
          seller_id: selectedChef._id,
          payment_method: "online"
        })
      });
      
      if (res.success) {
        toast.success("Subscription purchased successfully!");
        navigate("/my-subscription");
      } else {
        toast.error(res.message || "Failed to purchase subscription");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase subscription");
    } finally {
      setSubscribing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {step !== "plans" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(step === "confirm" ? "chefs" : "plans")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {step === "plans" && "Subscription Plans"}
              {step === "chefs" && "Select Home Chef"}
              {step === "confirm" && "Confirm Subscription"}
            </h1>
            <p className="text-muted-foreground">
              {step === "plans" && "Choose a plan that works for you"}
              {step === "chefs" && `for ${selectedPlan?.plan_name}`}
              {step === "confirm" && "Review and confirm your subscription"}
            </p>
          </div>
        </div>

        {/* Plans Step */}
        {step === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPlan?._id === plan._id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.banner_image && (
                  <div className="h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={plan.banner_image}
                      alt={plan.plan_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                    {plan.badge && (
                      <Badge variant="secondary">{plan.badge}</Badge>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{formatCurrency(plan.total_amount)}</span>
                    <span className="text-muted-foreground">for {plan.total_days} days</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>₹{plan.per_day_value.toFixed(0)} per day value</span>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button className="w-full" onClick={() => handleSelectPlan(plan)}>
                    Select Plan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Chefs Step */}
        {step === "chefs" && selectedPlan && (
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium">{selectedPlan.plan_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(selectedPlan.total_amount)} • {selectedPlan.total_days} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-lg font-semibold mt-6 mb-4">Choose your Home Chef</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeChefs.map((chef) => (
                <Card
                  key={chef._id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleSelectChef(chef)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {chef.image ? (
                          <img src={chef.image} alt={chef.businessName} className="w-full h-full object-cover" />
                        ) : (
                          <ChefHat className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{chef.businessName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {chef.address?.city || "Location not specified"}
                        </p>
                        <Badge variant="outline" className="mt-1">Home Chef</Badge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === "confirm" && selectedPlan && selectedChef && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Confirm Your Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedPlan.plan_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedPlan.total_days} days</p>
                    </div>
                    <span className="font-bold">{formatCurrency(selectedPlan.total_amount)}</span>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Home Chef</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="font-medium">{selectedChef.businessName}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Payment will go to admin wallet. Admin will transfer to the home chef.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay {formatCurrency(selectedPlan.total_amount)}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
