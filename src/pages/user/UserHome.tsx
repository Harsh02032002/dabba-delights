import { useState } from 'react';
import { UserLayout } from '@/layouts/UserLayout';
import { FoodToggle } from '@/components/user/FoodToggle';
import { FoodCard, SellerCard } from '@/components/user/FoodCard';
import { mockSellers, mockMenuItems, getSellerById, getSellersByType } from '@/data/mockData';
import { SellerType } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, Clock, Shield, Truck, Star } from 'lucide-react';

export default function UserHome() {
  const [foodType, setFoodType] = useState<SellerType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSellers = getSellersByType(foodType);
  
  const featuredItems = mockMenuItems.filter(item => {
    const seller = getSellerById(item.sellerId);
    if (!seller) return false;
    if (foodType !== 'all' && seller.type !== foodType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        seller.businessName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <UserLayout onSearch={setSearchQuery}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-success/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              Fresh & Authentic Food Delivered
            </div>
            
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Home-Cooked Meals &
              <span className="text-primary"> Restaurant Delights</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Discover authentic home-cooked meals from local chefs or order from your favorite restaurants. 
              Fresh, delicious, and delivered to your doorstep.
            </p>
            
            {/* Food Type Toggle */}
            <FoodToggle value={foodType} onChange={setFoodType} />
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Truck className="text-success" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">30min</p>
                  <p className="text-sm text-muted-foreground">Avg. Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {foodType === 'all' 
                ? 'Popular Kitchens & Restaurants'
                : foodType === 'home_chef' 
                  ? 'Home Chefs Near You' 
                  : 'Top Restaurants'}
            </h2>
            <p className="text-muted-foreground">
              Discover the best food near your location
            </p>
          </div>
          <Button variant="ghost" className="gap-2">
            View All <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSellers.map(seller => (
            <SellerCard key={seller._id} seller={seller} />
          ))}
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Dishes'}
            </h2>
            <p className="text-muted-foreground">
              {featuredItems.length} dishes available
            </p>
          </div>
          <Button variant="ghost" className="gap-2">
            View All <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.slice(0, 8).map(item => {
            const seller = getSellerById(item.sellerId);
            if (!seller) return null;
            return <FoodCard key={item._id} item={item} seller={seller} />;
          })}
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Clock size={16} />
              Daily / Weekly / Monthly Plans
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Subscribe & Save Up to 20%
            </h2>
            
            <p className="text-white/80 mb-6">
              Get your favorite meals delivered daily with our subscription plans. 
              Perfect for busy professionals and families.
            </p>
            
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Explore Subscriptions
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            How Dabba Nation Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting delicious food delivered to your doorstep has never been easier
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Choose Your Meal',
              description: 'Browse through home chefs or restaurants. Filter by cuisine, ratings, and dietary preferences.',
            },
            {
              step: '02',
              title: 'Place Your Order',
              description: 'Add items to cart, apply offers, and choose your preferred payment method.',
            },
            {
              step: '03',
              title: 'Enjoy Fresh Food',
              description: 'Track your order in real-time and enjoy freshly prepared meals at your doorstep.',
            },
          ].map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="text-6xl font-display font-bold text-primary/10 mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </UserLayout>
  );
}
