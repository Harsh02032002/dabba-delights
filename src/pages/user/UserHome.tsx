import { useState } from "react";
import { UserLayout } from "@/layouts/UserLayout";
import { FoodCard, SellerCard } from "@/components/user/FoodCard";
import { userAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { SellerType } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Link } from "react-router-dom";
import { PromoBanners } from "@/components/user/PromoBanners";

export default function UserHome() {
  const savedType = (localStorage.getItem("preferredFoodType") || "restaurant") as SellerType;
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handle "all" case by showing both restaurants and home chefs
  const showAllTypes = savedType === "all";

  // Sellers — dynamic only
  const { data: sellers = [] as any[], isLoading: sellersLoading } = useQuery({
    queryKey: ["sellers", savedType, searchQuery],
    queryFn: async () => {
      try {
        const res: any = await userAPI.getSellers({
          type: showAllTypes ? undefined : savedType,
          search: searchQuery || undefined,
        });
        const s = Array.isArray(res) ? res : res?.sellers || res?.data || [];
        return s;
      } catch {
        return [];
      }
    },
  });

  // Menu Items — dynamic only with proper filtering
  const { data: menuItems = [] as any[], isLoading: menuLoading } = useQuery({
    queryKey: ["menu-items", savedType, searchQuery],
    queryFn: async () => {
      try {
        const res: any = await userAPI.getMenuItems({ 
          type: showAllTypes ? undefined : savedType,
          search: searchQuery || undefined 
        });
        let p = Array.isArray(res) ? res : res?.products || res?.data || res?.menu || [];
        return p;
      } catch {
        return [];
      }
    },
  });

  // Filter by search
  const filteredItems = menuItems.filter((item: any) => {
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
                  {savedType === "home_chef" ? "Home Chefs Near You" : savedType === "restaurant" ? "Top Restaurants" : "All Sellers"}
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSellers.map((seller: any) => (
                  <SellerCard key={seller._id} seller={seller} />
                ))}
              </div>
              {filteredSellers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No {typeLabel.toLowerCase()}s found.</p>
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
                <p className="text-center text-muted-foreground py-8">No dishes found. Try a different search.</p>
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
          </>
        )}
      </div>
    </UserLayout>
  );
}
