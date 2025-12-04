import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Wine, Sparkles, Grape, DollarSign, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Wine as WineType } from '../App';

interface WineDetailsModalProps {
  wine: WineType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WineDetailsModal({ wine, isOpen, onClose }: WineDetailsModalProps) {
  if (!wine) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white/95 backdrop-blur-2xl rounded-3xl max-w-5xl w-full my-8"
              style={{
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-[#2c2c2c] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left Side - Image */}
                <div className="relative h-[400px] lg:h-auto bg-gradient-to-br from-[#f8f5f2] to-[#f0ebe6] rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none overflow-hidden">
                  <ImageWithFallback
                    src={wine.imageUrl}
                    alt={wine.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Match Score Badge - Large */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="absolute bottom-6 left-6 px-6 py-3 bg-white/95 backdrop-blur-md rounded-2xl border border-white/60"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-[#d4af37] fill-[#d4af37]" />
                      <div>
                        <div className="text-[#2c2c2c]">{wine.matchScore}%</div>
                        <div className="text-[#6b6b6b]">Perfect Match</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Side - Details */}
                <div className="p-8 lg:p-10 overflow-y-auto max-h-[600px]">
                  {/* Type Badge */}
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white rounded-full mb-4">
                    {wine.type}
                  </div>

                  {/* Wine Name */}
                  <h2 className="mb-3 text-[#2c2c2c] font-serif">
                    {wine.name}
                  </h2>

                  {/* Winery and Year */}
                  <div className="flex items-center gap-3 text-[#6b6b6b] mb-4">
                    <Wine className="w-5 h-5" />
                    <span>{wine.winery}</span>
                    <span>•</span>
                    <span>{wine.year}</span>
                  </div>

                  {/* Region */}
                  <div className="flex items-center gap-3 text-[#6b6b6b] mb-6">
                    <MapPin className="w-5 h-5" />
                    <span>{wine.region}, {wine.country}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-8 p-4 bg-gradient-to-br from-[#d4af37]/10 to-[#8b4049]/10 rounded-xl border border-[#d4af37]/20">
                    <DollarSign className="w-6 h-6 text-[#8b4049]" />
                    <div>
                      <div className="text-[#6b6b6b]">Price</div>
                      <div className="text-[#2c2c2c]">${wine.price}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent mb-6" />

                  {/* Tasting Notes */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-[#2c2c2c] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#d4af37]" />
                      Tasting Notes
                    </h3>
                    <p className="text-[#6b6b6b] leading-relaxed">
                      {wine.tastingNotes}
                    </p>
                  </div>

                  {/* Flavor Profile */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-[#2c2c2c] flex items-center gap-2">
                      <Grape className="w-5 h-5 text-[#8b4049]" />
                      Flavor Profile
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {wine.flavorProfile.map((flavor, index) => (
                        <motion.span
                          key={flavor}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-[#d4af37]/20 to-[#8b4049]/20 text-[#8b4049] border border-[#d4af37]/30"
                        >
                          {flavor}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Food Pairings */}
                  <div className="mb-6">
                    <h3 className="mb-3 text-[#2c2c2c]">
                      Recommended Pairings
                    </h3>
                    <div className="space-y-2">
                      {wine.pairings.map((pairing, index) => (
                        <motion.div
                          key={pairing}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/80"
                        >
                          <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                          <span className="text-[#2c2c2c]">{pairing}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Why This Matches - Highlighted */}
                  <div className="p-5 bg-gradient-to-br from-[#d4af37]/10 to-[#8b4049]/10 rounded-2xl border border-[#d4af37]/30">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#d4af37] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="mb-2 text-[#2c2c2c]">
                          Why This Matches Your Taste
                        </h4>
                        <p className="text-[#6b6b6b] leading-relaxed">
                          {wine.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white rounded-full"
                    style={{
                      boxShadow: '0 10px 30px rgba(139, 64, 73, 0.3)',
                    }}
                  >
                    Select This Wine
                  </motion.button>
                </div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 blur-3xl pointer-events-none"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
