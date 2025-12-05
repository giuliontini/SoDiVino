"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { ArrowRightIcon, BrainIcon, SparklesIcon, WineIcon } from "./icons";

interface LandingPageProps {
  ctaLabel?: string;
}

export function LandingPage({ ctaLabel = "Begin Your Journey" }: LandingPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f3ed] via-white to-[#f3e8e1] text-[#2c2c2c]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-16 left-10 h-40 w-40 rounded-full bg-[#d4af37]/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-[#8b4049]/20 blur-3xl" />
      </div>
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2 text-[#8b4049]">
          <WineIcon className="h-7 w-7" />
          <span className="font-semibold">So Divino</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-sm font-medium text-[#8b4049] underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </header>

      <main className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 text-center">
        <div className="mt-12 flex items-center gap-3 text-[#8b4049]">
          <SparklesIcon className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">AI Sommelier</span>
          <SparklesIcon className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-4xl font-serif text-[#2c2c2c] sm:text-5xl">Your Personal Wine Concierge</h1>
        <p className="mt-4 max-w-3xl text-lg text-[#5c5c5c]">
          Upload a wine list, share a few taste cues, and let So Divino return curated picks you can order with
          confidence.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
          <FeatureCard icon={<BrainIcon className="h-6 w-6" />} title="Smart matches" description="Powered by the same recommendation engine used in the legacy flow, wrapped in the new UX." />
          <FeatureCard icon={<WineIcon className="h-6 w-6" />} title="Tailored to you" description="Capture only the essentials—style, sweetness, and mood—no technical sliders." />
          <FeatureCard icon={<SparklesIcon className="h-6 w-6" />} title="Menu aware" description="Upload a list, get parsed items, and see ranked picks for your night out." />
        </div>

        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-8 py-3 text-white shadow-lg transition hover:translate-y-[-2px] hover:shadow-xl"
        >
          {ctaLabel}
          <ArrowRightIcon className="h-5 w-5" />
        </button>

        <div className="mt-14 grid w-full gap-6 rounded-3xl bg-white/70 p-6 shadow-lg sm:grid-cols-2">
          <div className="space-y-3 text-left">
            <h2 className="text-xl font-semibold text-[#2c2c2c]">How it works</h2>
            <ol className="space-y-2 text-[#4a4a4a]">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">1</span>
                <div>
                  <p className="font-medium text-[#2c2c2c]">Tell us your vibe</p>
                  <p>Pick preferred styles, sweetness, and adventurousness in the onboarding quiz.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">2</span>
                <div>
                  <p className="font-medium text-[#2c2c2c]">Upload a menu</p>
                  <p>We parse the list and store a session so recommendations stay tied to that night.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">3</span>
                <div>
                  <p className="font-medium text-[#2c2c2c]">Get curated picks</p>
                  <p>See the top matches with reasons and tags so you can order quickly.</p>
                </div>
              </li>
            </ol>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#fdf7f2] to-[#f1d7cf] p-6 text-left shadow-inner">
            <div className="flex items-center gap-2 text-[#8b4049]">
              <WineIcon className="h-8 w-8" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em]">Preview</p>
                <p className="text-lg font-semibold text-[#2c2c2c]">New recommendation shell</p>
              </div>
            </div>
            <p className="mt-4 text-[#4a4a4a]">
              The legacy persona sliders have been retired. The new flow stores simplified taste profiles and menu sessions
              so the backend keeps working while the UI follows the Figma direction.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl bg-white/80 p-5 text-left shadow-sm ring-1 ring-white/70">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">{icon}</div>
      <p className="mt-3 text-lg font-semibold text-[#2c2c2c]">{title}</p>
      <p className="text-sm text-[#555]">{description}</p>
    </div>
  );
}
