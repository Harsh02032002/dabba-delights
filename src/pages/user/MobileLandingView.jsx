import { motion } from "framer-motion";
import { Home, Store, MapPin, ChevronDown, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export function MobileLandingView({ navigate, location, detecting, detectLocation, handleSelect }) {
  return (
    <div className="flex md:hidden flex-col h-full w-full relative z-30">
      {/* 1. Header with About Button */}
      <header className="flex items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/about")} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white">
            About
          </button>
          <button onClick={() => navigate("/login")} className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-lg">
            Join
          </button>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
        {/* Location Picker */}
        <button onClick={detectLocation} className="flex items-center gap-2 bg-white/90 border rounded-full px-4 py-1.5 shadow-sm mb-6">
          <MapPin className="w-3 h-3 text-primary" />
          <p className="text-[10px] font-bold">{detecting ? "..." : location || "Location"}</p>
          <ChevronDown className="w-2 h-2" />
        </button>

        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black leading-tight text-gray-900">
            What are you <br />
            <span className="text-primary italic">craving</span> today?
          </h1>
        </div>

        {/* 3. SLIM CARDS (150px width as requested) */}
        <div className="flex flex-col gap-4 items-center">
          {/* Home Chef Card */}
          <motion.div
            onClick={() => handleSelect("home_chef")}
            className="relative rounded-[1.5rem] overflow-hidden shadow-2xl cursor-pointer w-[150px] h-[130px] border-2 border-white/20"
            whileTap={{ scale: 0.95 }}
          >
            <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative p-3 text-white text-center flex flex-col items-center justify-center h-full">
              <Home className="mb-1 w-5 h-5 text-yellow-400" />
              <h3 className="text-xs font-black">Home Chef</h3>
            </div>
          </motion.div>

          {/* Restaurant Card */}
          <motion.div
            onClick={() => handleSelect("restaurant")}
            className="relative rounded-[1.5rem] overflow-hidden shadow-2xl cursor-pointer w-[150px] h-[130px] border-2 border-white/20"
            whileTap={{ scale: 0.95 }}
          >
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative p-3 text-white text-center flex flex-col items-center justify-center h-full">
              <Store className="mb-1 w-5 h-5 text-orange-400" />
              <h3 className="text-xs font-black">Restaurant</h3>
            </div>
          </motion.div>
        </div>

        <button onClick={() => navigate("/home")} className="mt-6 text-[10px] font-bold text-gray-500 underline uppercase tracking-widest">
          Browse everything
        </button>
      </main>

      <footer className="text-center py-4 text-[9px] text-gray-400 font-bold">
        © 2026 DABBA NATION
      </footer>
    </div>
  );
}