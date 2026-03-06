import { UserLayout } from '@/layouts/UserLayout';
import { ChefHat, Heart, Shield, Truck, Users, Star } from 'lucide-react';

export default function AboutUs() {
  const currentYear = new Date().getFullYear();

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">About Dabba Nation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connecting you with authentic home-cooked meals and the best restaurants in your city since {currentYear - 2}.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dabba Nation was born from a simple idea — everyone deserves access to delicious, home-cooked food. 
              We started as a small platform connecting home chefs with food lovers in Mumbai, and have since grown 
              into a comprehensive food delivery platform serving thousands of customers daily.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our platform bridges the gap between talented home chefs, established restaurants, and hungry customers. 
              Whether you crave authentic gharelu khana or restaurant-quality dishes, Dabba Nation has you covered.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">What Makes Us Different</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: ChefHat, title: 'Home Chefs', desc: 'Verified home chefs preparing authentic meals with love and care.' },
                { icon: Shield, title: 'Quality Assured', desc: 'Every kitchen is verified and food quality is regularly monitored.' },
                { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable delivery to your doorstep, every time.' },
                { icon: Heart, title: 'Made with Love', desc: 'Home-cooked meals prepared with traditional recipes and fresh ingredients.' },
                { icon: Users, title: 'Community First', desc: 'Supporting local home chefs and empowering small food businesses.' },
                { icon: Star, title: 'Top Rated', desc: 'Consistently rated 4.5+ by thousands of satisfied customers.' },
              ].map(item => (
                <div key={item.title} className="bg-card rounded-2xl p-6 shadow-card text-center">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <item.icon size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To democratize the food industry by giving every talented home chef a platform to showcase their culinary 
              skills, while providing customers with affordable, healthy, and delicious food options delivered right to 
              their doorstep.
            </p>
          </section>

          <section className="bg-secondary/50 rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Join the Dabba Nation Family</h2>
            <p className="text-muted-foreground mb-6">
              Whether you're a food lover, a home chef, or a restaurant owner — there's a place for you here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/register" className="inline-flex items-center px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold">
                Order Now
              </a>
              <a href="/seller/register" className="inline-flex items-center px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold">
                Become a Seller
              </a>
            </div>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          © {currentYear} Dabba Nation. All rights reserved.
        </p>
      </div>
    </UserLayout>
  );
}
