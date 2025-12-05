"use client";

import { motion } from "motion/react";
import { Sparkles, TrendingUp, Award, MapPin, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "./image-with-fallback";

export interface RecommendationView {
  id: string;
  name: string;
  producer?: string;
  region?: string;
  country?: string;
  grape?: string;
  vintage?: string;
  price?: number;
  currency?: string;
  reason: string;
  tags: string[];
  score: number;
  rawText: string;
}

interface ResultsPageProps {
  personaName: string;
  recommendations: RecommendationView[];
  onWineSelect: (wine: RecommendationView) => void;
  onChangePersona: () => void;
  onUploadAnother: () => void;
}

export function ResultsPage({ personaName, recommendations, onWineSelect, onChangePersona, onUploadAnother }: ResultsPageProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen overflow-hidden py-16 px-6">
      <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-[#d4af37]/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-[#8b4049]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/50 px-6 py-3 backdrop-blur-md">
            <Award className="h-5 w-5 text-[#d4af37]" />
            <span className="text-[#6b6b6b]">
              Curated for: <span className="text-[#8b4049]">{personaName}</span>
            </span>
          </div>

          <h1 className="mb-4 font-serif text-[#2c2c2c]">Your Perfect Matches</h1>
          <p className="mx-auto max-w-2xl text-[#6b6b6b]">
            Based on your taste profile, we&apos;ve discovered these wines that align beautifully with your preferences.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
            <button onClick={onChangePersona} className="rounded-full border border-[#d4af37]/50 bg-white px-4 py-2 font-semibold text-[#8b4049] transition hover:-translate-y-0.5 hover:border-[#d4af37]">
              Try a different persona
            </button>
            <button onClick={onUploadAnother} className="rounded-full border border-[#8b4049]/50 bg-[#8b4049] px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md">
              Upload another menu
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {recommendations.map((wine, index) => (
            <motion.div
              key={wine.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ y: -8 }}
              onClick={() => onWineSelect(wine)}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-white/60 bg-white/50 shadow-2xl backdrop-blur-lg"
              style={{ boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#f8f5f2] to-[#f0ebe6]">
                <ImageWithFallback
                  src={`https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80&auto=format&fit=crop&sig=${index}`}
                  alt={wine.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/90 px-4 py-2">
                  <div className="flex items-center gap-2 text-[#8b4049]">
                    <TrendingUp className="h-4 w-4" />
                    <span>{Math.round(wine.score)}% Match</span>
                  </div>
                </div>

                <div className="absolute left-4 top-4 rounded-full bg-[#8b4049] px-3 py-1 text-sm text-white">{wine.grape || "Signature"}</div>
              </div>

              <div className="space-y-3 p-6">
                <div>
                  <h3 className="text-[#2c2c2c]">{wine.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#6b6b6b]">
                    {wine.producer && <span>{wine.producer}</span>}
                    {wine.vintage && <span>• {wine.vintage}</span>}
                  </div>
                </div>

                {(wine.region || wine.country) && (
                  <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[wine.region, wine.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {wine.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 to-[#8b4049]/10 px-3 py-1 text-xs text-[#8b4049]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl border border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/5 to-[#8b4049]/5 p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-1 h-4 w-4 text-[#d4af37]" />
                    <div>
                      <p className="text-[#2c2c2c]">Why this matches</p>
                      <p className="text-sm text-[#6b6b6b]">{wine.reason}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-[#6b6b6b]">
                  <span>{wine.price ? `${wine.currency ?? "$"}${wine.price}` : wine.rawText}</span>
                  <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-5 py-2 text-white">
                    View details
                  </motion.span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/60 bg-white/50 p-6 text-center text-[#6b6b6b]">
            No recommendations yet. Upload a wine list to see matches.
            <div className="mt-4 flex justify-center">
              <button onClick={onUploadAnother} className="inline-flex items-center gap-2 text-[#8b4049] underline">
                <ArrowLeft className="h-4 w-4" /> Back to upload
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
