import { motion } from 'motion/react';
import { Wine, Sparkles, Heart, Compass, Star, Globe } from 'lucide-react';
import type { Persona } from '../App';

interface PersonaSelectorProps {
  onSelectPersona: (persona: Persona) => void;
}

const personas: Persona[] = [
  {
    id: 'adventurer',
    name: 'The Adventurer',
    description: 'Bold and curious, always seeking new flavors and unexpected combinations.',
    icon: 'Compass',
    traits: ['Experimental', 'Daring', 'Open-minded'],
  },
  {
    id: 'classicist',
    name: 'The Classicist',
    description: 'Appreciates timeless elegance and traditional wine-making excellence.',
    icon: 'Star',
    traits: ['Refined', 'Traditional', 'Sophisticated'],
  },
  {
    id: 'romantic',
    name: 'The Romantic',
    description: 'Seeks wines that tell a story, with soft, approachable, and memorable profiles.',
    icon: 'Heart',
    traits: ['Emotional', 'Sensory', 'Expressive'],
  },
  {
    id: 'connoisseur',
    name: 'The Connoisseur',
    description: 'Deep knowledge and appreciation for terroir, vintages, and winemaking craft.',
    icon: 'Wine',
    traits: ['Knowledgeable', 'Discerning', 'Analytical'],
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    description: 'Passionate about discovering rare wines from emerging regions worldwide.',
    icon: 'Globe',
    traits: ['Curious', 'Global', 'Innovative'],
  },
  {
    id: 'hedonist',
    name: 'The Hedonist',
    description: 'Pure pleasure-seeker focused on rich, full-bodied wines that delight the senses.',
    icon: 'Sparkles',
    traits: ['Indulgent', 'Sensual', 'Bold'],
  },
];

const iconMap = {
  Compass,
  Star,
  Heart,
  Wine,
  Globe,
  Sparkles,
};

export function PersonaSelector({ onSelectPersona }: PersonaSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden py-16 px-6"
    >
      {/* Background Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8b4049]/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="mb-4 text-[#2c2c2c] font-serif">
            Choose Your Wine Persona
          </h1>
          <p className="text-[#6b6b6b] max-w-2xl mx-auto">
            Select the profile that best reflects your wine preferences. 
            Our AI will tailor recommendations to match your unique taste journey.
          </p>
        </motion.div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona, index) => {
            const Icon = iconMap[persona.icon as keyof typeof iconMap];
            
            return (
              <motion.button
                key={persona.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPersona(persona)}
                className="group relative bg-white/50 backdrop-blur-lg border border-white/60 rounded-3xl p-8 text-left overflow-hidden transition-all"
                style={{
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Gradient Overlay on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-[#8b4049]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-[#8b4049]" />
                  </div>

                  {/* Name */}
                  <h3 className="mb-3 text-[#2c2c2c]">
                    {persona.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[#6b6b6b] mb-4">
                    {persona.description}
                  </p>

                  {/* Traits */}
                  <div className="flex flex-wrap gap-2">
                    {persona.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37]/10 to-[#8b4049]/10 text-[#8b4049] border border-[#d4af37]/20"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sparkle Effect */}
                <motion.div
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* AI Decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/40 backdrop-blur-md border border-white/60 rounded-full">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#d4af37]"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
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
