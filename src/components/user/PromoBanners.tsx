import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PromoBanners() {
  const { data } = useQuery({
    queryKey: ["user-banners"],
    queryFn: () => userAPI.getActiveBanners(),
    staleTime: 10 * 60 * 1000,
  });

  const banners: any[] = Array.isArray(data)
    ? data
    : data?.banners || data?.campaigns || [];

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-slide every 5s
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!banners.length) return null;

  const banner = banners[current];

  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* Banner Content */}
      <div
        className="relative h-40 sm:h-48 md:h-56 flex items-center transition-all duration-500"
        style={{
          background: banner.content?.image
            ? `url(${banner.content.image}) center/cover no-repeat`
            : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Text */}
        <div className="relative z-10 px-6 sm:px-10 max-w-lg">
          <h3 className="text-white font-display text-xl sm:text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg">
            {banner.content?.title || banner.name || "Special Offer"}
          </h3>
          <p className="text-white/80 text-sm sm:text-base drop-shadow">
            {banner.content?.body || banner.description || "Check out our latest deals!"}
          </p>
          {banner.code && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <span className="text-white text-xs font-medium">Use code:</span>
              <span className="text-white font-bold text-sm tracking-wider">{banner.code}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === current ? "bg-white w-5" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
