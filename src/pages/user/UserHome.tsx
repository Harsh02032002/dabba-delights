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
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function UserHome() {
  const [foodType, setFoodType] = useState<SellerType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { 
    data: sellersData = [], 
    isLoading: sellersLoading 
  } = useQuery({
    queryKey: ["sellers", foodType, searchQuery],
    queryFn: () =>
      userAPI.getSellers({
        type: foodType === "all" ? undefined : foodType,
        search: searchQuery || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const { 
    data: menuData = [], 
    isLoading: menuLoading 
  } = useQuery({
    queryKey: ["menu-items", searchQuery],
    queryFn: () => userAPI.getMenuItems({ search: searchQuery || undefined }),
    placeholderData: (prev) => prev,
  });

  const sellers = (sellersData as any[]) || [];
  const menuItems = (menuData as any[]) || [];

  const filteredSellers = sellers.filter((s: any) => {
    if (foodType !== "all" && s.type !== foodType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(s.businessName || "").toLowerCase().includes(q) ||
      String(s.description || "").toLowerCase().includes(q)
    );
  });

  const featuredItems = menuItems.filter((item: any) => {
    const seller = sellers.find((s: any) => s._id === item.sellerId);
    if (!seller) return false;
    if (foodType !== "all" && seller.type !== foodType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        String(item.name || "").toLowerCase().includes(q) ||
        String(item.description || "").toLowerCase().includes(q) ||
        String(seller.businessName || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const SkeletonCards = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <UserLayout onSearch={setSearchQuery}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-success/20 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles size={16} />
              Fresh & Authentic Food Delivered
            </div>
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-foreground md:text-6xl">
              Home-Cooked Meals & <span className="text-primary">Restaurant Delights</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Discover authentic home-cooked meals from local chefs or order from your favorite restaurants. Fresh, delicious, and delivered to your doorstep.
            </p>
            <FoodToggle value={foodType} onChange={setFoodType} />
            <div className="mt-10 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Star className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Truck className="text-success" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">30min</p>
                  <p className="text-sm text-muted-foreground">Avg. Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Shield className="text-warning" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Safe & Hygenic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sellers */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {foodType === "all"
                ? "Popular Kitchens & Restaurants"
                : foodType === "home_chef"
                ? "Home Chefs Near You"
                : "Top Restaurants"}
            </h2>
            <p className="text-muted-foreground">Discover the best food near your location</p>
          </div>
          <Button variant="ghost" className="gap-2" onClick={() => navigate("/all-products")}>
            View All <ChevronRight size={16} />
          </Button>
        </div>
        {sellersLoading ? <SkeletonCards /> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredSellers.map((seller) => (
              <SellerCard key={seller._id} seller={seller} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Dishes */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Dishes"}
            </h2>
            <p className="text-muted-foreground">{featuredItems.length} dishes available</p>
          </div>
          <Button variant="ghost" className="gap-2" onClick={() => navigate("/all-products")}>
            View All <ChevronRight size={16} />
          </Button>
        </div>
        {menuLoading ? <SkeletonCards /> : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredItems.slice(0, 8).map((item) => {
              const seller = sellers.find((s: any) => s._id === item.sellerId);
              if (!seller) return null;
              return <FoodCard key={item._id} item={item} seller={seller} />;
            })}
          </div>
        )}
      </section>

      {/* Subscription Banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="gradient-primary relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
              <Clock size={16} />
              Daily / Weekly / Monthly Plans
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
              Subscribe & Save Up to 20%
            </h2>
            <p className="mb-6 text-white/80">
              Get your favorite meals delivered daily with our subscription plans. Perfect for busy professionals and families.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Explore Subscriptions
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground">
            How Dabba Nation Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Getting delicious food delivered to your doorstep has never been easier
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Choose Your Meal",
              description: "Browse through home chefs or restaurants. Filter by cuisine, ratings, and dietary preferences.",
            },
            {
              step: "02",
              title: "Place Your Order",
              description: "Add items to cart, apply offers, and choose your preferred payment method.",
            },
            {
              step: "03",
              title: "Enjoy Fresh Food",
              description: "Track your order in real-time and enjoy freshly prepared meals at your doorstep.",
            },
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="mb-4 font-display text-6xl font-bold text-primary/10">
                {item.step}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  );
}
