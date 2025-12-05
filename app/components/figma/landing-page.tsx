"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, Wine, Brain, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "./image-with-fallback";

interface LandingPageProps {
  onStart: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
}

const PARTICLE_COUNT = 20;

export function LandingPage({ onStart, onLogin, onSignup }: LandingPageProps) {
  const particlePositions = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 900),
        duration: 10 + Math.random() * 10,
      })),
    []
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#d4af37] opacity-20"
            initial={{ x: pos.x, y: pos.y }}
            animate={{ x: Math.random() * pos.x, y: Math.random() * pos.y }}
            transition={{ duration: pos.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-10">
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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8 flex items-center gap-3">
          <div className="relative">
            <Wine className="h-10 w-10 text-[#8b4049]" />
            <motion.div className="absolute -right-1 -top-1" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="h-4 w-4 text-[#d4af37]" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mb-12 max-w-4xl text-center">
          <h1 className="mb-6 font-serif text-4xl text-[#2c2c2c] sm:text-5xl">So DiVino</h1>
          <p className="mb-8 text-[#8b4049]">Your Personal AI Sommelier</p>
          <p className="mx-auto max-w-xl text-[#6b6b6b]">
            Experience the perfect wine match powered by artificial intelligence. Upload your restaurant&apos;s wine list and discover
            personalized recommendations tailored to your unique taste profile.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          {[
            { title: "AI-Powered", desc: "Smart matching algorithms" },
            { title: "Personalized", desc: "Tailored to your palate" },
            { title: "Effortless", desc: "Instant recommendations" },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -5, scale: 1.02 }}
              className="rounded-2xl border border-white/60 bg-white/40 p-6 text-center backdrop-blur-md"
              style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)" }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#8b4049]/20">
                <Brain className="h-6 w-6 text-[#8b4049]" />
              </div>
              <h3 className="mb-2 text-[#2c2c2c]">{feature.title}</h3>
              <p className="text-[#6b6b6b]">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-12 py-4 text-white"
            style={{ boxShadow: "0 10px 40px rgba(139, 64, 73, 0.3)" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#8b4049]"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative flex items-center gap-2">
              Begin Your Journey
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>

          <div className="flex gap-3 text-sm text-[#6b6b6b]">
            {onLogin && (
              <button className="font-semibold text-[#8b4049] underline" onClick={onLogin}>
                Log in
              </button>
            )}
            {onSignup && (
              <button className="font-semibold text-[#8b4049] underline" onClick={onSignup}>
                Create an account
              </button>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} className="relative mt-16">
          <div className="h-64 w-64 overflow-hidden rounded-full border-4 border-white/60 shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761095596660-851475f7e036?auto=format&fit=crop&w=800&q=80"
              alt="Luxury wine glasses"
              className="h-full w-full object-cover"
            />
          </div>
          <motion.div
            className="absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/40 bg-gradient-to-br from-[#d4af37]/30 to-[#8b4049]/30 backdrop-blur-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        <div className="mt-10 text-sm text-[#6b6b6b]">
          Prefer the classic flow? Head directly to the <Link className="font-semibold text-[#8b4049] underline" href="/login">auth pages</Link>.
        </div>
      </div>
    </motion.div>
  );
}
