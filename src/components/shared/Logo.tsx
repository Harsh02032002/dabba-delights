import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-center w-24 h-24",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.img
        src={logo}
        alt="Dabba Nation"
        className="w-full h-full object-cover rounded-full shadow-xl border-4 border-white"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}