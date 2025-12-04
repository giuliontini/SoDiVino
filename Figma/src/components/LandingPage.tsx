import { motion } from 'motion/react';
import { Sparkles, Wine, Brain, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden"
    >
      {/* AI Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4af37] rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Neural Network Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <motion.path
          d="M 0 100 Q 400 50 800 100 T 1600 100"
          stroke="#d4af37"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M 0 300 Q 400 250 800 300 T 1600 300"
          stroke="#8b4049"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
        />
      </svg>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="relative">
            <Wine className="w-10 h-10 text-[#8b4049]" />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-4xl mb-12"
        >
          <h1 className="mb-6 text-[#2c2c2c] font-serif">
            So Divino
          </h1>
          <p className="text-[#8b4049] mb-8 max-w-2xl mx-auto">
            Your Personal AI Sommelier
          </p>
          <p className="text-[#6b6b6b] max-w-xl mx-auto">
            Experience the perfect wine match powered by artificial intelligence. 
            Upload your restaurant's wine list and discover personalized recommendations 
            tailored to your unique taste profile.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full"
        >
          {[
            { icon: Brain, title: 'AI-Powered', desc: 'Smart matching algorithms' },
            { icon: Wine, title: 'Personalized', desc: 'Tailored to your palate' },
            { icon: Sparkles, title: 'Effortless', desc: 'Instant recommendations' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-6 text-center"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20 mb-4">
                <feature.icon className="w-6 h-6 text-[#8b4049]" />
              </div>
              <h3 className="mb-2 text-[#2c2c2c]">{feature.title}</h3>
              <p className="text-[#6b6b6b]">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="group relative px-12 py-4 bg-gradient-to-r from-[#8b4049] to-[#6d323a] text-white rounded-full overflow-hidden"
          style={{
            boxShadow: '0 10px 40px rgba(139, 64, 73, 0.3)',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#8b4049]"
            initial={{ x: '100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
          <span className="relative flex items-center gap-2">
            Begin Your Journey
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>

        {/* Decorative Wine Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 relative"
        >
          <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/60 shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761095596660-851475f7e036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwZ2xhc3NlcyUyMHJlc3RhdXJhbnQlMjBsdXh1cnl8ZW58MXx8fHwxNzY0MTE0ODc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Luxury wine glasses"
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-[#8b4049]/30 backdrop-blur-xl border border-white/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
