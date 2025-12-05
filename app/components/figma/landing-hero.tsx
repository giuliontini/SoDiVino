"use client";

import Link from "next/link";

interface LandingHeroProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingHero({ onLogin, onSignup }: LandingHeroProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6] text-[#2c2c2c]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-[#d4af37]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#8b4049]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.15),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(139,64,73,0.12),transparent_40%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-lg backdrop-blur">
          <span className="text-sm uppercase tracking-[0.2em] text-[#8b4049]">So DiVino</span>
          <span className="h-1 w-1 rounded-full bg-[#d4af37]" aria-hidden="true" />
          <span className="text-sm text-[#6b6b6b]">AI Sommelier</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Experience the new So DiVino concierge.
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-[#6b6b6b]">
            Upload a wine list, set your preferences, and let our agent craft recommendations that match your exact vibe. The new interface is brighter, faster, and fully wired to your personalized cellar.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLogin}
            className="rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-8 py-3 text-base font-semibold text-white shadow-xl shadow-[#8b4049]/20 transition hover:translate-y-[-1px] hover:shadow-2xl hover:shadow-[#8b4049]/30"
          >
            Log in
          </button>
          <button
            onClick={onSignup}
            className="rounded-full border border-[#d4af37]/60 bg-white/70 px-8 py-3 text-base font-semibold text-[#8b4049] shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-[#d4af37] hover:bg-white"
          >
            Create an account
          </button>
        </div>

        <div className="mt-12 grid w-full gap-6 sm:grid-cols-3">
          {["AI taste matching", "Menu photo parsing", "Curated pairings"].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/70 bg-white/60 p-6 text-left shadow-xl shadow-black/5 backdrop-blur"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-[#8b4049]">{item}</p>
              <p className="mt-3 text-sm text-[#6b6b6b]">
                Built into the refreshed experience with the same reliable service layer under the hood.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm text-[#6b6b6b]">
          Prefer the classic flow? Visit the <Link className="font-semibold text-[#8b4049] underline" href="/login">auth pages</Link> to hop in.
        </div>
      </main>
    </div>
  );
}
