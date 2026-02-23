import { useState } from "react";
import { UserLayout } from "@/layouts/UserLayout";
import { FoodToggle } from "@/components/user/FoodToggle";
import { FoodCard, SellerCard } from "@/components/user/FoodCard";
import { userAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { SellerType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Sparkles,
  Clock,
  Shield,
  Truck,
  Star,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { safeArray } from "@/utils/safeArray";

export default function UserHome() {
  const [foodType, setFoodType] = useState<SellerType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sellers Query — select guarantees array output, NEVER an object
  const {
    data: sellers = [] as any[],
    isLoading: sellersLoading,
  } = useQuery({
    queryKey: ["sellers", foodType, searchQuery],
    queryFn: () =>
      userAPI.getSellers({
        type: foodType === "all" ? undefined : foodType,
        search: searchQuery || undefined,
      }),
    select: (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.sellers)) return res.sellers;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
    placeholderData: (previousData) => previousData,
  });

  // Menu Items Query — select guarantees array output
  const {
    data: menuItems = [] as any[],
    isLoading: menuLoading,
  } = useQuery({
    queryKey: ["menu-items", searchQuery],
    queryFn: () =>
      userAPI.getMenuItems({
        search: searchQuery || undefined,
      }),
    select: (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.products)) return res.products;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.menu)) return res.menu;
      return [];
    },
    placeholderData: (previousData) => previousData,
  });

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Tera toggle, search bar, etc. */}
        <FoodToggle value={foodType} onChange={setFoodType} />

        {sellersLoading || menuLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Featured Items section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Featured Delights
                </h2>
                <Button variant="ghost" className="gap-1">
                  View All <ChevronRight size={16} />
                </Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {menuItems
                  .filter((item: any) => {
                    const seller = sellers.find((s: any) => s._id === item.sellerId);
                    if (!seller) return false;
                    if (foodType !== "all" && seller.type !== foodType) return false;
                    if (searchQuery) {
                      const q = searchQuery.toLowerCase();
                      return (
                        String(item.name || "").toLowerCase().includes(q) ||
                        String(item.description || "").toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .slice(0, 12)
                  .map((item: any) => {
                    const seller = sellers.find((s: any) => s._id === item.sellerId);
                    if (!seller) return null;
                    return (
                      <FoodCard key={item._id} item={item} seller={seller} />
                    );
                  })}
              </div>
            </section>

            {/* Sellers section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Top {foodType === "all" ? "Chefs & Restaurants" : foodType === "home_chef" ? "Home Chefs" : "Restaurants"}
                </h2>
                <Button variant="ghost" className="gap-1">
                  View All <ChevronRight size={16} />
                </Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sellers
                  .filter((seller: any) => {
                    if (foodType !== "all" && seller.type !== foodType) return false;
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      String(seller.businessName || "").toLowerCase().includes(q) ||
                      String(seller.description || "").toLowerCase().includes(q)
                    );
                  })
                  .map((seller: any) => (
                    <SellerCard key={seller._id} seller={seller} />
                  ))}
              </div>
            </section>

            {/* Tera baki sections jaise How it Works etc. */}
            <section className="py-16 bg-gradient-to-b from-background to-secondary/20 rounded-3xl my-12">
              <div className="text-center max-w-3xl mx-auto px-4">
                <h2 className="text-4xl font-display font-bold text-foreground mb-6">
                  How It Works
                </h2>
                <p className="text-lg text-muted-foreground mb-12">
                  Getting delicious food delivered to your doorstep has never been
                  easier
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Choose Your Meal",
                    description:
                      "Browse through home chefs or restaurants. Filter by cuisine, ratings, and dietary preferences.",
                  },
                  {
                    step: "02",
                    title: "Place Your Order",
                    description:
                      "Add items to cart, apply offers, and choose your preferred payment method.",
                  },
                  {
                    step: "03",
                    title: "Enjoy Fresh Food",
                    description:
                      "Track your order in real-time and enjoy freshly prepared meals at your doorstep.",
                  },
                ].map((item) => (
                  <div key={item.step} className="relative text-center">
                    <div className="mb-4 font-display text-6xl font-bold text-primary/10">
                      {item.step}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
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