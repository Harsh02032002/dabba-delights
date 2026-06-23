import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { UserLayout } from "@/layouts/UserLayout";
import {
  ChefHat,
  Heart,
  Shield,
  Rocket,
  Utensils,
  Star,
  Globe,
  Package,
  Home,
  Users,
  Truck,
  Smartphone,
  Building2,
  Award,
} from "lucide-react";

const DEFAULTS = {
  aboutTagline: "Empowering Home Chefs & Restaurants Across India",
  aboutIntro:
    "Dabba Nation is an Indian food-tech platform founded by Akash Dwivedi with a vision to transform the way people discover, order, and enjoy food. Our platform connects customers with talented home chefs, tiffin service providers, and restaurants through a single trusted ecosystem.\n\nWe believe that every home chef deserves an opportunity to earn, every restaurant deserves access to more customers, and every customer deserves fresh, hygienic, and affordable food delivered with convenience.\n\nDabba Nation was created to bridge this gap by providing a technology-driven platform that enables food entrepreneurs to grow their businesses while ensuring customers have access to quality meals anytime, anywhere.",
  aboutMission:
    "To empower home chefs, restaurants, and local food entrepreneurs by providing them with technology, visibility, and growth opportunities while delivering quality food experiences to customers across India.",
  aboutVision:
    "To become India's most trusted food ecosystem, connecting millions of customers with home chefs, restaurants, and food businesses through innovation, trust, and technology.",
  aboutFounderName: "Akash Dwivedi",
  aboutFounderDesc:
    "Driven by a passion for entrepreneurship and innovation, Akash founded Dabba Nation with the goal of creating opportunities for home chefs, supporting local food businesses, and making quality food accessible to everyone.\n\nUnder his leadership, Dabba Nation continues to build a platform focused on trust, convenience, affordability, and growth for both customers and food partners.",
  aboutTechLeadName: "Harshdeep",
  aboutTechLeadDesc:
    "The technical development and platform engineering of Dabba Nation is led by Harshdeep, who plays a key role in building, managing, and improving the technology infrastructure that powers the Dabba Nation platform.",
  aboutUdyamNumber: "UDYAM-UP-21-0060612",
  platformName: "Dabba Nation",
};

const WHAT_WE_DO = [
  { icon: Package, label: "Home-Cooked Food Delivery" },
  { icon: Utensils, label: "Daily & Monthly Tiffin Services" },
  { icon: Building2, label: "Restaurant Food Ordering" },
  { icon: Star, label: "Food Subscription Plans" },
  { icon: ChefHat, label: "Home Chef Partner Program" },
  { icon: Home, label: "Restaurant Partner Network" },
  { icon: Truck, label: "Reliable Food Delivery Services" },
  { icon: Smartphone, label: "Digital Food Commerce Platform" },
];

export default function AboutUs() {
  const { data: config } = useQuery({
    queryKey: ['public-platform-config'],
    queryFn: () => publicAPI.getPlatformConfig(),
    staleTime: 1000 * 60 * 10,
  });

  const get = (key: keyof typeof DEFAULTS): string =>
    ((config as Record<string, unknown>)?.[key] as string) || DEFAULTS[key];

  const currentYear = new Date().getFullYear();

  return (
    <UserLayout>
      <div className="relative overflow-hidden bg-[#fffcf9]">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-orange-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-red-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-6 py-16 max-w-5xl relative z-10">
          {/* ── Hero ── */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-widest text-orange-600 uppercase bg-orange-100 rounded-full">
              About Us
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                {get("platformName")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 max-w-3xl mx-auto">
              {get("aboutTagline")}
            </p>
          </div>

          {/* ── Intro ── */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-5">
              {get("aboutIntro")
                .split("\n\n")
                .map((para: string, i: number) => (
                  <p key={i} className="text-gray-600 leading-relaxed text-lg">
                    {para}
                  </p>
                ))}
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-[3rem] rotate-3 absolute inset-0" />
              <div className="relative aspect-square bg-white rounded-[3rem] shadow-2xl border border-orange-50 flex items-center justify-center p-10">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    {
                      icon: Heart,
                      label: "Authentic",
                      bg: "bg-orange-50",
                      color: "text-orange-500",
                    },
                    {
                      icon: Shield,
                      label: "Trusted",
                      bg: "bg-red-50",
                      color: "text-red-500",
                    },
                    {
                      icon: Rocket,
                      label: "Fast",
                      bg: "bg-yellow-50",
                      color: "text-yellow-600",
                    },
                    {
                      icon: Globe,
                      label: "Local",
                      bg: "bg-green-50",
                      color: "text-green-600",
                    },
                  ].map(({ icon: Icon, label, bg, color }) => (
                    <div
                      key={label}
                      className={`p-5 ${bg} rounded-2xl flex flex-col items-center text-center`}
                    >
                      <Icon className={`${color} mb-2`} size={28} />
                      <span className="text-xs font-bold uppercase text-gray-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── What We Do ── */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 mb-3 text-sm font-bold tracking-widest text-orange-600 uppercase bg-orange-100 rounded-full">
                What We Do
              </span>
              <h2 className="text-3xl font-bold text-gray-800">Our Services</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {WHAT_WE_DO.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-white border border-orange-100 rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Icon size={22} className="text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Mission & Vision ── */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-lg">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Rocket size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {get("aboutMission")}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-lg">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-5 shadow-md">
                <Globe size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {get("aboutVision")}
              </p>
            </div>
          </div>

          {/* ── Founder ── */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-orange-100 shadow-xl shadow-orange-100/20 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Users size={26} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">
                  Founder & CEO
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {get("aboutFounderName")}
                </h3>
              </div>
            </div>
            <div className="space-y-4">
              {get("aboutFounderDesc")
                .split("\n\n")
                .map((para: string, i: number) => (
                  <p
                    key={i}
                    className="text-gray-600 leading-relaxed text-base"
                  >
                    {para}
                  </p>
                ))}
            </div>
          </div>

          {/* ── Tech Lead ── */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-orange-100 shadow-xl shadow-orange-100/20 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Smartphone size={26} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
                  Technology & Product Development
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {get("aboutTechLeadName")}
                </h3>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {get("aboutTechLeadDesc")}
            </p>
          </div>

          {/* ── MSME Badge ── */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md border border-orange-100 shrink-0">
              <Award size={28} className="text-orange-500" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-gray-800">
                Registered MSME Enterprise
              </p>
              <p className="text-sm text-gray-500">
                Government of India — Udyam Registration No:{" "}
                <span className="font-mono font-semibold text-orange-600">
                  {get("aboutUdyamNumber")}
                </span>
              </p>
            </div>
          </div>

          {/* ── CTA ── */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10">
                <Utensils size={40} />
              </div>
              <div className="absolute bottom-10 right-10">
                <Star size={40} />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fresh Food. Trusted Partners. Delivered with Care.
            </h2>
            <p className="text-gray-300 mb-10 max-w-xl mx-auto">
              Whether you're a food lover looking for a meal or a chef looking
              for a platform — your journey starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-900/20 hover:-translate-y-1"
              >
                Start Ordering
              </a>
              <a
                href="/seller/register"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1"
              >
                Partner With Us
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-10 italic">
              "Empowering Home Chefs &amp; Restaurants Across India."
            </p>
          </section>

          <p className="text-center text-sm font-medium text-gray-400 mt-12">
            &copy; {currentYear} {get("platformName")}. Crafted with ❤️ for
            great taste.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
