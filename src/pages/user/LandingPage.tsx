import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { Home, Store, MapPin, ChevronDown, UtensilsCrossed, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#fffcf9] relative overflow-hidden flex flex-col font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/60 border-b border-orange-100/50 py-4 px-6 flex items-center justify-between">
        <Logo size="md" showText />
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/about")} className="hidden md:flex font-medium hover:text-orange-600 transition-colors">About</Button>
          <Button variant="ghost" onClick={() => navigate("/seller/login")} className="font-medium hover:text-orange-600 transition-colors">Seller Portal</Button>
          <Button 
            variant="default" 
            onClick={() => navigate("/login")} 
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200 rounded-full px-6 transition-transform active:scale-95"
          >
            Join Us
          </Button>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        
        {/* Location Selector (Pill Style) */}
        <div className="mb-10 group">
          <button
            onClick={detectLocation}
            className="flex items-center gap-3 bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 rounded-full px-5 py-2.5 transition-all duration-300 group"
          >
            <div className="bg-orange-100 p-1.5 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <MapPin size={16} />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Deliver to</p>
              <span className="text-sm font-semibold text-gray-700">
                {detecting ? "Locating..." : location || "Detect my location"}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        {/* Hero Text */}
        <div className="text-center max-w-4xl mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            What are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">craving</span> today?
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            From the warmth of a <span className="font-semibold text-orange-600">Home Kitchen</span> to the bold flavors of your <span className="font-semibold text-red-600">Favorite Bistro</span>.
          </p>
        </div>

        {/* Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          
          {/* Home Chef Card */}
          <button
            onClick={() => handleSelect("home_chef")}
            className="group relative bg-white rounded-[2.5rem] p-8 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(249,115,22,0.15)] transition-all duration-500 hover:-translate-y-3 flex flex-col items-start overflow-hidden"
          >
            {/* Animated Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-100 rounded-full blur-3xl group-hover:bg-orange-200 transition-colors duration-500" />
            
            <div className="mb-6 relative">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Home size={32} className="text-white" />
              </div>
            </div>
            
            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                Home Chef <Sparkles size={18} className="text-orange-400" />
              </h3>
              <p className="text-gray-500 leading-relaxed text-left italic">
                "Ghar jaisa swad." Fresh dabbas made with love by local experts.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-orange-600 font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Order Now <UtensilsCrossed size={14} />
            </div>
          </button>

          {/* Restaurant Card */}
          <button
            onClick={() => handleSelect("restaurant")}
            className="group relative bg-white rounded-[2.5rem] p-8 border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(220,38,38,0.15)] transition-all duration-500 hover:-translate-y-3 flex flex-col items-start overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-50 rounded-full blur-3xl group-hover:bg-red-100 transition-colors duration-500" />
            
            <div className="mb-6 relative">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Store size={32} className="text-white" />
              </div>
            </div>

            <div className="relative">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Restaurant</h3>
              <p className="text-gray-500 leading-relaxed text-left">
                Signature dishes from top-rated restaurants, delivered piping hot.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Menu <UtensilsCrossed size={14} />
            </div>
          </button>
        </div>

        {/* Browse All Link */}
        <button
          onClick={() => {
            localStorage.setItem("preferredFoodType", "all");
            navigate("/home");
          }}
          className="mt-12 text-gray-400 hover:text-orange-600 font-medium transition-all flex items-center gap-2 group"
        >
          Can't decide? <span className="underline underline-offset-4 decoration-orange-200 group-hover:decoration-orange-500">Browse everything</span>
        </button>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-xs font-medium text-gray-400">
        © {new Date().getFullYear()} Dabba Nation. Crafted for food lovers.
      </footer>
    </div>
  );
}