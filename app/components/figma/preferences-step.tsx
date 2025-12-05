"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Wine, Sparkles, ArrowRight } from "lucide-react";
import type { UserPreferences } from "@/lib/cellarTypes";

export interface PreferencesPayload {
  favorite_grapes: string[];
  quality_tier: UserPreferences["quality_tier"];
  usual_budget_min: number | null;
  usual_budget_max: number | null;
  risk_tolerance: UserPreferences["risk_tolerance"];
}

interface PreferencesStepProps {
  preferences: UserPreferences | null;
  onSubmit: (payload: PreferencesPayload) => Promise<void>;
  onSkip?: () => void;
  loading?: boolean;
  submitting?: boolean;
  error?: string | null;
}

const particleDefaults = { width: 1200, height: 900 };

export function PreferencesStep({ preferences, onSubmit, onSkip, loading = false, submitting = false, error }: PreferencesStepProps) {
  const [favoriteGrapes, setFavoriteGrapes] = useState("");
  const [qualityTier, setQualityTier] = useState<UserPreferences["quality_tier"]>(preferences?.quality_tier ?? "value");
  const [budgetMin, setBudgetMin] = useState<string>(preferences?.usual_budget_min?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState<string>(preferences?.usual_budget_max?.toString() ?? "");
  const [riskTolerance, setRiskTolerance] = useState<UserPreferences["risk_tolerance"]>(preferences?.risk_tolerance ?? "safe");

  useEffect(() => {
    if (preferences?.favorite_grapes?.length) {
      setFavoriteGrapes(preferences.favorite_grapes.join(", "));
    }
  }, [preferences]);

  const particles = useMemo(
    () =>
      Array.from({ length: 15 }, () => ({
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : particleDefaults.width),
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : particleDefaults.height),
        duration: 10 + Math.random() * 10,
      })),
    []
  );

  const handleSubmit = async () => {
    const payload: PreferencesPayload = {
      favorite_grapes: favoriteGrapes
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      quality_tier: qualityTier,
      usual_budget_min: budgetMin ? Number(budgetMin) : null,
      usual_budget_max: budgetMax ? Number(budgetMax) : null,
      risk_tolerance: riskTolerance,
    };

    await onSubmit(payload);
  };

  const disableSubmit = submitting || loading;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#d4af37] opacity-20"
            initial={{ x: pos.x, y: pos.y }}
            animate={{ x: Math.random() * pos.x, y: Math.random() * pos.y }}
            transition={{ duration: pos.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Wine className="h-8 w-8 text-[#8b4049]" />
            <h1 className="font-serif text-[#2c2c2c]">Tell Us Your Taste</h1>
          </div>
          <p className="max-w-2xl text-[#6b6b6b]">
            Share your favorite grapes, usual budgets, and how adventurous you are. We will use this to personalize the rest of the experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-3xl border border-white/80 bg-white/60 p-8 shadow-2xl backdrop-blur-lg"
        >
          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="grid gap-6 md:grid-cols-2">
            <label className="text-sm text-[#2c2c2c]">
              Favorite grapes (comma separated)
              <textarea
                value={favoriteGrapes}
                onChange={(event) => setFavoriteGrapes(event.target.value)}
                placeholder="Pinot Noir, Cabernet Sauvignon, Chardonnay"
                className="mt-2 h-32 w-full resize-none rounded-2xl border border-[#d4af37]/30 bg-white/80 px-4 py-3 text-sm text-[#2c2c2c] placeholder:text-[#a0a0a0] focus:border-[#8b4049]/50 focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30"
              />
            </label>
            <div className="space-y-4">
              <label className="block text-sm text-[#2c2c2c]">
                Quality tier
                <select
                  value={qualityTier}
                  onChange={(event) => setQualityTier(event.target.value as UserPreferences["quality_tier"])}
                  className="mt-2 w-full rounded-2xl border border-[#d4af37]/30 bg-white/80 px-4 py-3 text-sm text-[#2c2c2c] focus:border-[#8b4049]/50 focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30"
                >
                  <option value="value">Value</option>
                  <option value="premium">Premium</option>
                  <option value="collectible">Collectible</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-[#2c2c2c]">
                  Budget min
                  <input
                    type="number"
                    inputMode="decimal"
                    value={budgetMin}
                    onChange={(event) => setBudgetMin(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#d4af37]/30 bg-white/80 px-3 py-2 text-sm text-[#2c2c2c] focus:border-[#8b4049]/50 focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30"
                  />
                </label>
                <label className="text-sm text-[#2c2c2c]">
                  Budget max
                  <input
                    type="number"
                    inputMode="decimal"
                    value={budgetMax}
                    onChange={(event) => setBudgetMax(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#d4af37]/30 bg-white/80 px-3 py-2 text-sm text-[#2c2c2c] focus:border-[#8b4049]/50 focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30"
                  />
                </label>
              </div>
              <label className="block text-sm text-[#2c2c2c]">
                Risk tolerance
                <select
                  value={riskTolerance}
                  onChange={(event) => setRiskTolerance(event.target.value as UserPreferences["risk_tolerance"])}
                  className="mt-2 w-full rounded-2xl border border-[#d4af37]/30 bg-white/80 px-4 py-3 text-sm text-[#2c2c2c] focus:border-[#8b4049]/50 focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30"
                >
                  <option value="safe">Play it safe</option>
                  <option value="balanced">Balanced</option>
                  <option value="adventurous">Adventurous</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 rounded-xl bg-[#f0e6e6]/40 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 text-[#d4af37]" />
              <p className="text-sm text-[#6b6b6b]">We store these preferences with your account so recommendations start with your taste.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="rounded-full border border-[#d4af37]/40 bg-white px-5 py-3 text-sm font-semibold text-[#8b4049] transition hover:-translate-y-0.5 hover:border-[#d4af37]"
                >
                  Skip for now
                </button>
              )}
              <button
                type="button"
                disabled={disableSubmit}
                onClick={handleSubmit}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ boxShadow: disableSubmit ? "none" : "0 10px 40px rgba(139, 64, 73, 0.3)" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#8b4049]"
                  initial={{ x: "100%" }}
                  whileHover={{ x: disableSubmit ? "100%" : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {submitting ? "Saving preferences…" : "Save and continue"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
            <p className="mb-4 text-[#a0a0a0]">Need inspiration? Try mentioning:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Favorite wineries", "Wine regions", "Grape varieties", "Wine styles"].map((item) => (
                <span key={item} className="rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm text-[#6b6b6b]">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
