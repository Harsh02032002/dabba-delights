import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Store, MapPin, ChevronDown, UtensilsCrossed, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import traditionalWoman from "@/assets/traditional-woman.png";
import chefCharacter from "@/assets/chef-character.png";

/* ── Animated Character ── */
function AnimatedCharacter({ side, imageUrl, alt }) {
  const isLeft = side === "left";

  return (
    <motion.div
      className={`absolute top-1/2 -translate-y-1/2 ${
        isLeft ? "left-0" : "right-0"
      } z-10 hidden lg:block pointer-events-none`}
      initial={{ y: "-40%", opacity: 0 }}
      animate={{ y: "-50%", opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.img
        src={imageUrl}
        alt={alt}
        className="h-[460px] object-contain drop-shadow-2xl"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}

/* ── Landing Page ── */
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

            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "Your Location";

            const state = data.address?.state || "";

            setLocation(`${city}, ${state}`);
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
    }
  };

  const handleSelect = (type) => {
    localStorage.setItem("preferredFoodType", type);
    navigate("/home");
  };

  return (
    <div className="h-screen w-full bg-background relative overflow-hidden flex flex-col">
      
      {/* Full page background with professional overlay */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <img
          src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920&q=80"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/15 via-orange-600/10 to-red-600/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10" />
      </div>

      <AnimatedCharacter
        side="left"
        imageUrl={traditionalWoman}
        alt="Indian housewife"
      />

      <AnimatedCharacter
        side="right"
        imageUrl={chefCharacter}
        alt="Chef"
      />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <Logo />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/about")}
            className="hidden md:flex px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-medium"
          >
            About
          </button>

          <button
            onClick={() => navigate("/seller/login")}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-orange-500 text-white font-semibold hover:from-orange-500 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Seller Portal
          </button>

          <Button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white font-semibold rounded-full px-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Join Us
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4">

        {/* Location */}
        <button
          onClick={detectLocation}
          className="flex items-center gap-3 bg-white border rounded-full px-5 py-2 shadow mb-6"
        >
          <MapPin className="w-4 h-4 text-primary" />

          <div className="text-left">
            <p className="text-[10px] uppercase text-gray-500">
              Deliver to
            </p>

            <p className="text-sm flex items-center gap-1">
              {detecting ? "Locating..." : location || "Detect my location"}
              <ChevronDown className="w-3 h-3" />
            </p>
          </div>
        </button>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold">
            What are you{" "}
            <span className="text-primary italic drop-shadow-lg">craving</span> today?
          </h1>

          <p className="mt-4 text-gray-800 max-w-xl mx-auto">
            From the warmth of a{" "}
            <span className="text-green-700 font-semibold">
              Home Kitchen
            </span>{" "}
            to the bold flavors of your{" "}
            <span className="text-orange-600 font-semibold">
              Favorite Bistro
            </span>
          </p>
        </div>

        {/* Cards */}
        <div className="relative flex flex-col md:flex-row gap-8 max-w-4xl w-full justify-center items-center">

          {/* Home Chef */}
          <motion.div
            onClick={() => handleSelect("home_chef")}
            className="relative rounded-[2rem] overflow-hidden shadow-xl cursor-pointer w-[320px] h-[220px]"
          >
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="relative p-6 text-white">
              <Home className="mb-2" />

              <h3 className="text-xl font-bold">
                Home Chef <Sparkles className="inline w-4 h-4" />
              </h3>

              <p className="text-sm">
                Ghar jaisa swad. Fresh dabbas made with love.
              </p>
            </div>
          </motion.div>

          {/* Restaurant */}
          <motion.div
            onClick={() => handleSelect("restaurant")}
            className="relative rounded-[2rem] overflow-hidden shadow-xl cursor-pointer w-[320px] h-[220px]"
          >
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="relative p-6 text-white">
              <Store className="mb-2" />

              <h3 className="text-xl font-bold">
                Restaurant
              </h3>

              <p className="text-sm">
                Signature dishes from top-rated restaurants.
              </p>
            </div>
          </motion.div>

          
        </div>

        <button
          onClick={() => {
            localStorage.setItem("preferredFoodType", "all");
            navigate("/home");
          }}
          className="mt-8 text-gray-500 hover:text-primary"
        >
          Can't decide? <span className="underline">Browse everything</span>
        </button>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Dabba Nation
      </footer>

    </div>
  );
}