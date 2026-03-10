import { UserLayout } from '@/layouts/UserLayout';
import { ChefHat, Heart, Shield, Rocket, Utensils, Star, Globe } from 'lucide-react';

export default function AboutUs() {
  const currentYear = new Date().getFullYear();

  return (
    <UserLayout>
      <div className="relative overflow-hidden bg-[#fffcf9]">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-orange-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-6 py-16 max-w-5xl relative z-10">
          
          {/* Hero Section */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-orange-600 uppercase bg-orange-100 rounded-full">
              Our Journey
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              About Us – <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Dabba Nation</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed italic">
              "Dabba Nation – One Platform, Endless Flavors."
            </p>
          </div>

          {/* Core Story Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                Modern Food Delivery, <br />
                <span className="text-orange-500">Built for Connection.</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Dabba Nation is a modern food delivery platform built to connect people with delicious meals from home chefs and restaurants in their city. Our mission is to make good food easily accessible, affordable, and reliable for everyone.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">
                We believe that food is more than just a meal — it’s comfort, culture, and connection. That’s why Dabba Nation brings together the authentic taste of home-cooked food and the variety of restaurant dishes on a single platform.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-[3rem] rotate-3 absolute inset-0" />
              <div className="relative aspect-square bg-white rounded-[3rem] shadow-2xl border border-orange-50 flex items-center justify-center p-12">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-orange-50 rounded-2xl flex flex-col items-center text-center">
                    <Heart className="text-orange-500 mb-2" size={32} />
                    <span className="text-xs font-bold uppercase text-gray-400">Authentic</span>
                  </div>
                  <div className="p-6 bg-red-50 rounded-2xl flex flex-col items-center text-center">
                    <Shield className="text-red-500 mb-2" size={32} />
                    <span className="text-xs font-bold uppercase text-gray-400">Trusted</span>
                  </div>
                  <div className="p-6 bg-yellow-50 rounded-2xl flex flex-col items-center text-center">
                    <Rocket className="text-yellow-600 mb-2" size={32} />
                    <span className="text-xs font-bold uppercase text-gray-400">Fast</span>
                  </div>
                  <div className="p-6 bg-green-50 rounded-2xl flex flex-col items-center text-center">
                    <Globe className="text-green-600 mb-2" size={32} />
                    <span className="text-xs font-bold uppercase text-gray-400">Local</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empowerment Section */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-orange-100 shadow-xl shadow-orange-100/20 mb-20">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-12 mb-4">
                <ChefHat size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Empowering Local Talents</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our platform not only helps customers discover great food but also empowers local home chefs, small kitchens, and restaurants to grow their business by reaching more customers.
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent w-full my-8" />
              <p className="text-gray-700 text-lg font-semibold">
                At Dabba Nation, we are committed to delivering quality food, quick service, and a trusted experience with every order.
              </p>
            </div>
          </div>

          {/* CTA / Join Family */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10"><Utensils size={40} /></div>
                <div className="absolute bottom-10 right-10"><Star size={40} /></div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to taste the magic?</h2>
            <p className="text-gray-300 mb-10 max-w-xl mx-auto">
              Whether you're a food lover looking for a meal or a chef looking for a platform — your journey starts here.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/register" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-900/20 hover:-translate-y-1">
                Start Ordering
              </a>
              <a href="/seller/register" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1">
                Partner With Us
              </a>
            </div>
          </section>

          {/* Footer mini */}
          <p className="text-center text-sm font-medium text-gray-400 mt-16">
            © {currentYear} Dabba Nation. Crafted with ❤️ for great taste.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}