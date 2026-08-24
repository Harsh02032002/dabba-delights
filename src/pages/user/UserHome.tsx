import { useState, useEffect } from "react";
import { UserLayout } from "@/layouts/UserLayout";
import { FoodCard, SellerCard } from "@/components/user/FoodCard";
import { userAPI } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SellerType } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Link } from "react-router-dom";
import { PromoBanners } from "@/components/user/PromoBanners";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, MapPin, Star, CheckCircle, Crown, TrendingUp, Store, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function UserHome() {
  const [savedType, setSavedType] = useState<SellerType>(
    (localStorage.getItem("preferredFoodType") || "all") as SellerType
  );
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const [locationCoords, setLocationCoords] = useState(() => {
    try { return JSON.parse(localStorage.getItem("userLocationCoords") || "null"); } catch { return null; }
  });
  const [locationName, setLocationName] = useState(() =>
    localStorage.getItem("userLocationName") || ""
  );

  // Re-read location when navbar updates it
  useEffect(() => {
    const onLocationUpdate = () => {
      try {
        setLocationCoords(JSON.parse(localStorage.getItem("userLocationCoords") || "null"));
        setLocationName(localStorage.getItem("userLocationName") || "");
      } catch {}
    };
    window.addEventListener("locationUpdated", onLocationUpdate);
    return () => window.removeEventListener("locationUpdated", onLocationUpdate);
  }, []);

  // Re-read preferredFoodType when user navigates back from Landing
  useEffect(() => {
    const onFocus = () => {
      const t = (localStorage.getItem("preferredFoodType") || "all") as SellerType;
      setSavedType(t);
    };
    window.addEventListener("focus", onFocus);
    // Also listen for custom event from Landing
    window.addEventListener("foodTypeUpdated", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("foodTypeUpdated", onFocus);
    };
  }, []);

  const showAllTypes = savedType === "all";

  // Sellers — nearby if location available, else all
  const { data: sellers = [] as any[], isLoading: sellersLoading } = useQuery({
    queryKey: ["sellers", savedType, searchQuery, locationCoords?.lat, locationCoords?.lng, locationName],
    queryFn: async () => {
      try {
        if (locationCoords?.lat && locationCoords?.lng) {
          const res: any = await userAPI.getNearbySellers({
            lat: locationCoords.lat,
            lng: locationCoords.lng,
            radius: 50000,
            city: locationName,
            type: showAllTypes ? undefined : savedType,
          });
          return Array.isArray(res) ? res : res?.sellers || [];
        }
        const res: any = await userAPI.getSellers({
          type: showAllTypes ? undefined : savedType,
          search: searchQuery || undefined,
        });
        return Array.isArray(res) ? res : res?.sellers || res?.data || [];
      } catch {
        return [];
      }
    },
  });

  // Menu Items — pass sellerIds to backend so it filters correctly
  const { data: menuItems = [] as any[], isLoading: menuLoading } = useQuery({
    queryKey: ["menu-items", savedType, searchQuery, sellers.map((s:any) => s._id).join(',')],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { search: searchQuery || undefined };
        if (locationCoords?.lat && locationCoords?.lng) {
          // Location set - only show menus of nearby sellers (empty if none found)
          if (sellers.length > 0) {
            params.sellerIds = sellers.map((s: any) => s._id).join(',');
          } else {
            return []; // No nearby sellers = no menus
          }
        } else if (!showAllTypes) {
          params.type = savedType;
        }
        const res: any = await userAPI.getMenuItems(params);
        return Array.isArray(res) ? res : res?.products || res?.data || res?.menu || [];
      } catch {
        return [];
      }
    },
    enabled: !sellersLoading,
  });

  // locationFilteredMenuItems = menuItems (already filtered by backend)
  const locationFilteredMenuItems = menuItems;

  // Filter by search
  const filteredItems = locationFilteredMenuItems.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(item.name || "").toLowerCase().includes(q) ||
      String(item.description || "").toLowerCase().includes(q)
    );
  });

  const filteredSellers = sellers.filter((seller: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(seller.businessName || "").toLowerCase().includes(q) ||
      String(seller.description || "").toLowerCase().includes(q)
    );
  });

  // Subscription Plans Query
  const { data: subscriptionPlans = [] as any[], isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans-preview"],
    queryFn: async () => {
      try {
        const res: any = await userAPI.getSubscriptionPlans();
        const plans = Array.isArray(res) ? res : res?.plans || res?.data || [];
        // Return only first 3 active plans
        return plans.filter((plan: any) => plan.is_active).slice(0, 3);
      } catch {
        return [];
      }
    },
  });

  const typeLabel = savedType === "home_chef" ? "Home Chef" : savedType === "restaurant" ? "Restaurant" : "All Sellers";

  return (
    <UserLayout onSearch={setSearchQuery}>
      <div className="container mx-auto px-4 py-8">
        {/* Promo Banners */}
        <section className="mb-8">
          <PromoBanners />
        </section>

        {/* Type indicator */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary rounded-2xl px-5 py-2.5">
            <span className="text-sm font-semibold text-foreground">
              Browsing: <span className="text-primary">{typeLabel}s</span>
            </span>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs h-7">Change</Button>
            </Link>
          </div>
        </div>

        {sellersLoading || menuLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Sellers First */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {locationName ? `Near ${locationName}` : savedType === "home_chef" ? "Home Chefs Near You" : savedType === "restaurant" ? "Top Restaurants" : "All Sellers"}
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSellers.map((seller: any) => (
                  <SellerCard key={seller._id} seller={seller} />
                ))}
              </div>
              {filteredSellers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {locationCoords?.lat && locationCoords?.lng ? "No service available at this location" : `No ${typeLabel.toLowerCase()}s found.`}
                </p>
              )}
            </section>

            {/* Menus Below */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {savedType === "home_chef" ? "Home-Cooked Delights" : savedType === "restaurant" ? "Popular Dishes" : "All Dishes"}
                </h2>
                <Link to="/all-products">
                  <Button variant="ghost" className="gap-1">View All <ChevronRight size={16} /></Button>
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item: any) => {
                // sellerId can be a populated object or a plain string
                const sellerIdStr = typeof item.sellerId === 'object' ? item.sellerId?._id : item.sellerId;
                const populatedSeller = typeof item.sellerId === 'object' ? item.sellerId : null;
                const seller = sellers.find((s: any) => s._id === sellerIdStr) || populatedSeller;
                if (!seller) return null;
                return <FoodCard key={item._id} item={item} seller={seller} />;
              })}
              </div>
              {filteredItems.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {locationCoords?.lat && locationCoords?.lng ? "No service available at this location" : "No dishes found. Try a different search."}
                </p>
              )}
            </section>

            {/* How It Works */}
            <section className="py-16 bg-gradient-to-b from-background to-secondary/20 rounded-3xl my-12">
              <div className="text-center max-w-3xl mx-auto px-4">
                <h2 className="text-4xl font-display font-bold text-foreground mb-6">How It Works</h2>
                <p className="text-lg text-muted-foreground mb-12">Getting delicious food delivered to your doorstep has never been easier</p>
              </div>
              <div className="grid gap-8 md:grid-cols-3 px-4">
                {[
                  { step: "01", title: "Choose Your Meal", description: "Browse through home chefs or restaurants. Filter by cuisine, ratings, and dietary preferences." },
                  { step: "02", title: "Place Your Order", description: "Add items to cart, apply offers, and choose your preferred payment method." },
                  { step: "03", title: "Enjoy Fresh Food", description: "Track your order in real-time and enjoy freshly prepared meals at your doorstep." },
                ].map((item) => (
                  <div key={item.step} className="relative text-center">
                    <div className="mb-4 font-display text-6xl font-bold text-primary/10">{item.step}</div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Subscription Plans */}
            <section className="py-16 bg-gradient-to-b from-secondary/20 to-background rounded-3xl my-12">
              <div className="text-center max-w-3xl mx-auto px-4 mb-12">
                <h2 className="text-4xl font-display font-bold text-foreground mb-6">Subscription Plans</h2>
                <p className="text-lg text-muted-foreground mb-8">Save more with our flexible subscription plans</p>
              </div>
              
              {/* Plans Preview */}
              <div className="max-w-6xl mx-auto px-4 mb-12">
                {plansLoading ? (
                  <div className="flex justify-center">
                    <LoadingSpinner />
                  </div>
                ) : subscriptionPlans.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan: any) => (
                      <Card key={plan._id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        {plan.badge && (
                          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                            {plan.badge}
                          </div>
                        )}
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center py-4">
                            <span className="text-4xl font-bold">₹{plan.total_amount}</span>
                            <span className="text-muted-foreground"> / {plan.total_days} days</span>
                            <p className="text-sm text-green-600 mt-1">
                              ₹{plan.per_day_value?.toFixed(2) || (plan.total_amount / plan.total_days).toFixed(2)} per day
                            </p>
                          </div>
                          
                          {plan.assigned_seller_id && (
                            <div className="text-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                              <Store className="w-4 h-4 inline mr-1" />
                              {plan.assigned_seller_id.businessName}
                            </div>
                          )}
                          
                          {plan.features && plan.features.length > 0 && (
                            <div className="space-y-2">
                              {plan.features.slice(0, 3).map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <Link to={`/subscriptions?planId=${plan._id}`}>
                            <Button className="w-full" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No subscription plans available at the moment.</p>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <Link to="/subscriptions">
                  <Button className="gap-2" size="lg">
                    View All Plans <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </UserLayout>
  );
}
