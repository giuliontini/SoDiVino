import { useState } from 'react';
import { motion } from 'motion/react';
import { Wine, Sparkles, ArrowRight, Brain } from 'lucide-react';

interface WinePreferencesInputProps {
  onSubmit: (preferences: string) => void;
}

export function WinePreferencesInput({ onSubmit }: WinePreferencesInputProps) {
  const [preferences, setPreferences] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (preferences.trim()) {
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        onSubmit(preferences);
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* AI Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4af37] rounded-full opacity-20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Wine className="w-8 h-8 text-[#8b4049]" />
            <h1 className="text-[#2c2c2c] font-serif">Tell Us Your Taste</h1>
          </div>
          <p className="text-[#6b6b6b] max-w-2xl">
            Share your favorite wines, producers, or vineyards. Our AI will learn your unique preferences 
            and create your personalized taste profile.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-white/60 backdrop-blur-lg border border-white/80 rounded-3xl p-8 shadow-2xl"
        >
          {!isProcessing ? (
            <>
              <div className="mb-6">
                <label className="block text-[#2c2c2c] mb-3">
                  Your Wine Preferences
                </label>
                <textarea
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="Example: Château Margaux, Opus One, Screaming Eagle Cabernet, Burgundy Grand Cru, Napa Valley Merlot..."
                  className="w-full h-64 px-6 py-4 bg-white/80 border border-[#d4af37]/30 rounded-2xl 
                           text-[#2c2c2c] placeholder:text-[#a0a0a0] resize-none
                           focus:outline-none focus:ring-2 focus:ring-[#8b4049]/30 focus:border-[#8b4049]/50
                           transition-all duration-300"
                  style={{
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  }}
                />
              </div>

              <div className="flex items-start gap-3 mb-6 p-4 bg-[#f0e6e6]/40 rounded-xl">
                <Sparkles className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <p className="text-[#6b6b6b]">
                  You can list specific bottles, wineries, regions, or even describe wines you've enjoyed. 
                  The more details you provide, the better we can match your taste.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!preferences.trim()}
                className="w-full group relative px-8 py-4 bg-gradient-to-r from-[#8b4049] to-[#6d323a] 
                         text-white rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300"
                style={{
                  boxShadow: preferences.trim() ? '0 10px 40px rgba(139, 64, 73, 0.3)' : 'none',
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#8b4049]"
                  initial={{ x: '100%' }}
                  whileHover={{ x: preferences.trim() ? 0 : '100%' }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  Analyze My Preferences
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                className="relative mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-16 h-16 text-[#8b4049]" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-full h-full rounded-full border-2 border-[#d4af37]" />
                </motion.div>
              </motion.div>

              <h3 className="text-[#2c2c2c] mb-3">Analyzing Your Taste Profile</h3>
              <p className="text-[#6b6b6b] text-center max-w-md">
                Our AI is learning your preferences and creating your personalized wine persona...
              </p>

              <div className="flex gap-2 mt-8">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-[#8b4049]"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Examples */}
        {!isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-[#a0a0a0] mb-4">Need inspiration? Try mentioning:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                'Favorite wineries',
                'Wine regions',
                'Specific vintages',
                'Grape varieties',
                'Wine styles',
              ].map((item, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-white/40 backdrop-blur-sm border border-white/60 
                           rounded-full text-[#6b6b6b]"
                >
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
