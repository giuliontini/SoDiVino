"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, MapPin, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./image-with-fallback";
import type { RecommendationView } from "./results-page";

interface WineDetailsModalProps {
  wine: RecommendationView | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WineDetailsModal({ wine, isOpen, onClose }: WineDetailsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && wine && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl backdrop-blur"
          >
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-[#6b6b6b] shadow-md">
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
              <div className="relative h-full bg-gradient-to-br from-[#f8f5f2] to-[#f0ebe6]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1672151606792-641b2510ac38?auto=format&fit=crop&w=800&q=80"
                  alt={wine.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full bg-[#8b4049] px-3 py-1 text-xs text-white">{wine.grape || "Signature"}</div>
                <div className="absolute bottom-4 right-4 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-[#8b4049]">
                  {Math.round(wine.score)}% match
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Recommendation</p>
                  <h3 className="text-2xl text-[#2c2c2c]">{wine.name}</h3>
                  <p className="text-sm text-[#6b6b6b]">{[wine.producer, wine.vintage].filter(Boolean).join(" • ")}</p>
                </div>

                {(wine.region || wine.country) && (
                  <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[wine.region, wine.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}

                <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-1 h-4 w-4 text-[#d4af37]" />
                    <div>
                      <p className="text-[#2c2c2c]">Why this matches</p>
                      <p className="text-sm text-[#6b6b6b]">{wine.reason}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#2c2c2c]">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {wine.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#8b4049]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Menu excerpt</p>
                  <p className="text-sm text-[#2c2c2c]">{wine.rawText}</p>
                </div>

                <button className="flex items-center gap-2 text-[#8b4049] underline" onClick={onClose}>
                  <ChevronRight className="h-4 w-4" /> Back to list
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
