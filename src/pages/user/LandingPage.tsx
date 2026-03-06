import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { Home, Store, MapPin, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);

  const detectLocation = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || "Your Location";
            const state = data.address?.state || "";
            setLocation(`${city}, ${state}`);
            localStorage.setItem("userLocation", JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              city,
              state,
              display: `${city}, ${state}`,
            }));
          } catch {
            setLocation("Mumbai, Maharashtra");
          }
          setDetecting(false);
        },
        () => {
          setLocation("Mumbai, Maharashtra");
          setDetecting(false);
        }
      );
    } else {
      setLocation("Mumbai, Maharashtra");
      setDetecting(false);
    }
  };

  const handleSelect = (type: "home_chef" | "restaurant") => {
    localStorage.setItem("preferredFoodType", type);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 flex items-center justify-between">
        <Logo size="md" showText />
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/about")} className="text-sm">About</Button>
          <Button variant="ghost" onClick={() => navigate("/seller/login")} className="text-sm">Seller Login</Button>
          <Button variant="gradient" onClick={() => navigate("/login")} className="text-sm">Login / Register</Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        {/* Location Picker */}
        <div className="mb-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">📍 Your delivery location</p>
          <button
            onClick={detectLocation}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 rounded-2xl px-6 py-3 transition-all"
          >
            <MapPin size={18} className="text-primary" />
            <span className="font-medium text-sm">
              {detecting ? "Detecting..." : location || "Detect my location"}
            </span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground text-center mb-4 leading-tight">
          What are you <span className="text-primary">craving</span> today?
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-16 max-w-xl">
          Choose your vibe — fresh homemade dabbas or your favourite restaurant meals, delivered hot to your door.
        </p>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
          {/* Home Chef Card */}
          <button
            onClick={() => handleSelect("home_chef")}
            className="group relative overflow-hidden rounded-3xl border-2 border-transparent hover:border-accent bg-card p-8 text-left transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <Home size={32} className="text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Home Chefs</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Authentic, home-cooked meals made with love by talented home chefs in your neighbourhood. Like eating at grandma's!
              </p>
              <div className="flex flex-wrap gap-2">
                {["Ghar ka Khana", "Tiffin Service", "Pure Veg Options", "Daily Menu"].map((tag) => (
                  <span key={tag} className="bg-accent/10 text-accent text-xs px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>

          {/* Restaurant Card */}
          <button
            onClick={() => handleSelect("restaurant")}
            className="group relative overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary bg-card p-8 text-left transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Store size={32} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Restaurants</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your favourite restaurants and cafés — from biryanis to burgers, pizzas to pav bhaji. Quick & delicious!
              </p>
              <div className="flex flex-wrap gap-2">
                {["Fast Delivery", "Wide Variety", "Party Orders", "Premium Dining"].map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* Browse All */}
        <button
          onClick={() => {
            localStorage.setItem("preferredFoodType", "all");
            navigate("/home");
          }}
          className="mt-8 text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors"
        >
          or browse everything →
        </button>
      </div>

      {/* Footer mini */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} Dabba Nation. All rights reserved.
      </footer>
    </div>
  );
}
