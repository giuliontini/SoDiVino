import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Award, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Persona, Wine } from '../App';

interface ResultsPageProps {
  persona: Persona;
  onWineSelect: (wine: Wine) => void;
}

const mockWines: Wine[] = [
  {
    id: '1',
    name: 'Château Margaux',
    winery: 'Château Margaux',
    year: 2015,
    region: 'Margaux, Bordeaux',
    country: 'France',
    type: 'Red Wine',
    price: 450,
    matchScore: 98,
    flavorProfile: ['Blackcurrant', 'Cedar', 'Tobacco', 'Violet'],
    tastingNotes: 'Exceptional complexity with velvety tannins, layers of dark fruit, and a finish that lingers with grace. A masterpiece of Bordeaux winemaking.',
    pairings: ['Wagyu Beef', 'Duck Confit', 'Aged Gruyère'],
    imageUrl: 'https://images.unsplash.com/photo-1672140940042-1f2e27cf64df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwYm90dGxlJTIwbWluaW1hbGlzdHxlbnwxfHx8fDE3NjQxMTQ4Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    reasoning: 'Your adventurous palate will appreciate the bold complexity and refined structure. This wine tells a story with every sip.',
  },
  {
    id: '2',
    name: 'Domaine de la Romanée-Conti',
    winery: 'DRC',
    year: 2016,
    region: 'Burgundy',
    country: 'France',
    type: 'Red Wine',
    price: 850,
    matchScore: 95,
    flavorProfile: ['Cherry', 'Rose', 'Earth', 'Spice'],
    tastingNotes: 'Ethereal and profound, with silky texture and remarkable depth. A wine that transcends description with its elegance.',
    pairings: ['Truffle Risotto', 'Wild Mushrooms', 'Roasted Quail'],
    imageUrl: 'https://images.unsplash.com/photo-1759931002745-50708843e356?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3aW5lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjQxMTQ4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    reasoning: 'The pinnacle of winemaking artistry matches your appreciation for exceptional quality and unique terroir expression.',
  },
  {
    id: '3',
    name: 'Chablis Grand Cru',
    winery: 'William Fèvre',
    year: 2018,
    region: 'Chablis, Burgundy',
    country: 'France',
    type: 'White Wine',
    price: 120,
    matchScore: 92,
    flavorProfile: ['Citrus', 'Flint', 'Green Apple', 'Minerality'],
    tastingNotes: 'Crisp and precise with remarkable minerality. Pure expression of Chardonnay with tension and elegance.',
    pairings: ['Fresh Oysters', 'Lobster', 'Goat Cheese'],
    imageUrl: 'https://images.unsplash.com/photo-1697115355190-c0048a1f1c17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHdpbmUlMjBib3R0bGUlMjBlbGVnYW50fGVufDF8fHx8MTc2NDExNDg3OXww&ixlib=rb-4.1.0&q=80&w=1080',
    reasoning: 'Your taste for distinctive character aligns perfectly with this mineral-driven, terroir-focused white.',
  },
  {
    id: '4',
    name: 'Dom Pérignon',
    winery: 'Moët & Chandon',
    year: 2012,
    region: 'Champagne',
    country: 'France',
    type: 'Sparkling',
    price: 280,
    matchScore: 90,
    flavorProfile: ['Brioche', 'Almond', 'White Flowers', 'Citrus'],
    tastingNotes: 'Legendary champagne with fine bubbles and extraordinary complexity. A celebration in every glass.',
    pairings: ['Caviar', 'Sushi', 'Foie Gras'],
    imageUrl: 'https://images.unsplash.com/photo-1749983030057-801e003ad976?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFtcGFnbmUlMjBib3R0bGUlMjBsdXh1cnl8ZW58MXx8fHwxNzY0MTE0ODc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    reasoning: 'Your appreciation for special moments pairs beautifully with this iconic champagne\'s refined character.',
  },
];

export function ResultsPage({ persona, onWineSelect }: ResultsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden py-16 px-6"
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8b4049]/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-full mb-6">
            <Award className="w-5 h-5 text-[#d4af37]" />
            <span className="text-[#6b6b6b]">Curated for: <span className="text-[#8b4049]">{persona.name}</span></span>
          </div>
          
          <h1 className="mb-4 text-[#2c2c2c] font-serif">
            Your Perfect Matches
          </h1>
          <p className="text-[#6b6b6b] max-w-2xl mx-auto">
            Based on your taste profile, we've discovered these exceptional wines 
            that align beautifully with your preferences.
          </p>
        </motion.div>

        {/* Wine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {mockWines.map((wine, index) => (
            <motion.div
              key={wine.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              onClick={() => onWineSelect(wine)}
              className="group cursor-pointer bg-white/50 backdrop-blur-lg border border-white/60 rounded-3xl overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Wine Image */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#f8f5f2] to-[#f0ebe6]">
                <ImageWithFallback
                  src={wine.imageUrl}
                  alt={wine.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Match Score Badge */}
                <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-white/60">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#8b4049]" />
                    <span className="text-[#8b4049]">{wine.matchScore}% Match</span>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#8b4049] text-white rounded-full">
                  {wine.type}
                </div>
              </div>

              {/* Wine Details */}
              <div className="p-6">
                {/* Name and Year */}
                <h3 className="mb-2 text-[#2c2c2c]">
                  {wine.name}
                </h3>
                <div className="flex items-center gap-2 text-[#6b6b6b] mb-3">
                  <span>{wine.winery}</span>
                  <span>•</span>
                  <span>{wine.year}</span>
                </div>

                {/* Region */}
                <div className="flex items-center gap-2 mb-4 text-[#6b6b6b]">
                  <MapPin className="w-4 h-4" />
                  <span>{wine.region}, {wine.country}</span>
                </div>

                {/* Flavor Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {wine.flavorProfile.slice(0, 3).map((flavor) => (
                    <span
                      key={flavor}
                      className="px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37]/10 to-[#8b4049]/10 text-[#8b4049] border border-[#d4af37]/20"
                    >
                      {flavor}
                    </span>
                  ))}
                </div>

                {/* Why This Matches */}
                <div className="p-4 bg-gradient-to-br from-[#d4af37]/5 to-[#8b4049]/5 rounded-xl border border-[#d4af37]/20 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[#2c2c2c] mb-1">Why this matches</p>
                      <p className="text-[#6b6b6b]">{wine.reasoning}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-[#2c2c2c]">${wine.price}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white rounded-full"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Info Footer */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl">
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
            <span className="text-[#6b6b6b]">
              Recommendations powered by AI taste profiling
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}