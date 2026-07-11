import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Store, MapPin, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import heroBg from "@/assets/hero-bg.jpg";
import logoImg from "@/assets/logo.png";
import charLeft from "@/assets/chef-character.png";
import charRight from "@/assets/traditional-woman.png";
import homeChefImg from "@/assets/home-chef.jpg";
import restaurantImg from "@/assets/restaurant.jpg";

/* ── Animated Character Component ── */
function AnimatedCharacter({
  side,
  src,
  alt,
}: {
  side: "left" | "right";
  src: string;
  alt: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const isLeft = side === "left";

  return (
    <div
      className={`fixed ${isLeft ? "left-0" : "right-0"} bottom-0 z-30 pointer-events-none
        md:bottom-0
      `}
    >
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`
          h-auto object-contain animate-float drop-shadow-lg
          ${isLeft
            ? "w-24 sm:w-28 md:w-32 lg:w-40 xl:w-52"
            : "w-20 sm:w-24 md:w-28 lg:w-36 xl:w-48"
          }
        `}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
          animationDelay: isLeft ? "0s" : "1.5s",
        }}
        loading="eager"
      />
    </div>
  );
}

/* ── Landing Page ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [detecting, setDetecting] = useState(false);

  // Load previously saved location on mount
  useEffect(() => {
    const saved = localStorage.getItem("userLocationName");
    if (saved) setLocation(saved);
  }, []);

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
            const locationStr = `${city}, ${state}`;
            setLocation(locationStr);
            // Save to localStorage so UserHome can use it
            localStorage.setItem("userLocationName", locationStr);
            localStorage.setItem("userLocationCoords", JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
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
    }
  };

  const handleSelect = (type: string) => {
    localStorage.setItem("preferredFoodType", type);
    window.dispatchEvent(new Event("foodTypeUpdated"));
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80" />
      </div>

      {/* Animated Characters */}
      <AnimatedCharacter side="left" src={charLeft} alt="Home Chef Character" />
      <AnimatedCharacter side="right" src={charRight} alt="Chef Character" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-12 py-4 md:py-6">
        <img
          src={logoImg}
          alt="Dabba Nation"
          className="w-14 h-14 md:w-20 md:h-20 rounded-full shadow-lg"
        />
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            onClick={() => navigate("/about")}
            className="hidden md:flex px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/20 hover:border-white/40 transition-all duration-300 font-medium"
            variant="ghost"
          >
            About
          </Button>
          <Button
            onClick={() => navigate("/seller/login")}
            className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:from-accent hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-sm"
          >
            Seller Portal
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="px-4 md:px-6 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:from-accent hover:to-primary transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-xs md:text-sm"
          >
            Join Us
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Location Button */}
        <motion.button
          onClick={detectLocation}
          className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-2 shadow mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MapPin className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Deliver to
            </p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              {detecting ? "Locating..." : location || "Detect my location"}
              <ChevronDown className="w-4 h-4" />
            </p>
          </div>
        </motion.button>

        {/* Hero Text */}
        <motion.div
          className="text-center mb-6 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground leading-tight">
            What are you{" "}
            <span className="italic text-primary">craving</span> today?
          </h1>
          <p className="mt-3 text-sm md:text-lg text-muted-foreground max-w-lg mx-auto">
            From the warmth of a{" "}
            <span className="font-semibold text-primary">Home Kitchen</span>{" "}
            to the bold flavors of your{" "}
            <span className="font-semibold text-primary">Favorite Bistro</span>
          </p>
        </motion.div>

        {/* Cards with characters on sides - mobile layout */}
        <motion.div
          className="relative flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-4xl justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Home Chef Card */}
          <motion.div
            onClick={() => handleSelect("home_chef")}
            className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl cursor-pointer w-[240px] h-[160px] sm:w-[260px] sm:h-[180px] md:w-[320px] md:h-[220px] will-change-transform"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <img src={homeChefImg} alt="Home Chef" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-3 md:p-5 text-white">
              <Home className="w-5 h-5 md:w-6 md:h-6 mb-1" />
              <h3 className="text-base md:text-xl font-bold flex items-center gap-1">
                Home Chef <Sparkles className="w-4 h-4" />
              </h3>
              <p className="text-xs md:text-sm opacity-90">
                Ghar jaisa swad. Fresh dabbas made with love.
              </p>
            </div>
          </motion.div>

          {/* Restaurant Card */}
          <motion.div
            onClick={() => handleSelect("restaurant")}
            className="relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl cursor-pointer w-[240px] h-[160px] sm:w-[260px] sm:h-[180px] md:w-[320px] md:h-[220px] will-change-transform"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <img src={restaurantImg} alt="Restaurant" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-3 md:p-5 text-white">
              <Store className="w-5 h-5 md:w-6 md:h-6 mb-1" />
              <h3 className="text-base md:text-xl font-bold">Restaurant</h3>
              <p className="text-xs md:text-sm opacity-90">
                Signature dishes from top-rated restaurants.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Browse Everything */}
        <button
          onClick={() => {
            localStorage.setItem("preferredFoodType", "all");
            window.dispatchEvent(new Event("foodTypeUpdated"));
            navigate("/home");
          }}
          className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Can't decide? <span className="underline">Browse everything</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Dabba Nation
      </footer>
    </div>
  );
}
