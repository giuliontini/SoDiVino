"use client";

import { motion } from "motion/react";
import { Wine, Sparkles, Heart, Compass, Star, Globe } from "lucide-react";
import type { WinePersona } from "@/lib/cellarTypes";

interface PersonaSelectorProps {
  personas: WinePersona[];
  selectedPersonaId: string | null;
  onSelectPersona: (personaId: string) => void;
  loading?: boolean;
}

const iconMap = { Compass, Star, Heart, Wine, Globe, Sparkles } as const;

function pickIcon(name: string) {
  const keys = Object.keys(iconMap) as (keyof typeof iconMap)[];
  const match = keys.find((key) => name.toLowerCase().includes(key.toLowerCase()));
  return match ? iconMap[match] : Sparkles;
}

export function PersonaSelector({ personas, selectedPersonaId, onSelectPersona, loading = false }: PersonaSelectorProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen overflow-hidden py-16 px-6">
      <div className="absolute left-10 top-20 h-96 w-96 rounded-full bg-[#d4af37]/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[#8b4049]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-16 text-center">
          <h1 className="mb-4 font-serif text-[#2c2c2c]">Choose Your Wine Persona</h1>
          <p className="mx-auto max-w-2xl text-[#6b6b6b]">Select the profile that best reflects your wine preferences. Our AI will tailor recommendations to match your unique taste journey.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading && personas.length === 0 && (
            <div className="col-span-full rounded-3xl border border-white/60 bg-white/60 p-8 text-center text-[#6b6b6b] shadow-2xl">Loading personas…</div>
          )}
          {personas.map((persona, index) => {
            const Icon = pickIcon(persona.name);
            const isSelected = persona.id === selectedPersonaId;

            return (
              <motion.button
                key={persona.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPersona(persona.id)}
                className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 p-8 text-left shadow-2xl transition-all backdrop-blur-lg ${
                  isSelected ? "ring-2 ring-[#8b4049]" : ""
                }`}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-[#8b4049]/5 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative z-10 space-y-3">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 transition-transform group-hover:scale-110">
                    <Icon className="h-8 w-8 text-[#8b4049]" />
                  </div>
                  <h3 className="text-[#2c2c2c]">{persona.name}</h3>
                  {persona.notes && <p className="text-sm text-[#6b6b6b]">{persona.notes}</p>}
                  <div className="flex flex-wrap gap-2 text-xs text-[#8b4049]">
                    {persona.grapes.slice(0, 3).map((grape) => (
                      <span key={grape} className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-1">
                        {grape}
                      </span>
                    ))}
                    {persona.body !== "unknown" && <span className="rounded-full border border-[#8b4049]/30 bg-[#8b4049]/10 px-3 py-1">{persona.body} body</span>}
                    {persona.sweetness !== "unknown" && <span className="rounded-full border border-[#8b4049]/30 bg-[#8b4049]/10 px-3 py-1">{persona.sweetness} sweetness</span>}
                  </div>
                </div>

                <motion.div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-5 w-5 text-[#d4af37]" />
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-6 py-3 backdrop-blur-md">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-[#d4af37]"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <span className="text-[#6b6b6b]">AI-Powered Matching</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
