"use client";

import type React from "react";
import { MapPinIcon, SparklesIcon, WineIcon } from "./icons";
import type { WineRecommendation, WineItem } from "@/lib/wineTypes";

interface RecommendationResultsProps {
  wines: WineItem[];
  recommendations: WineRecommendation[];
  restaurantName?: string | null;
  isLoading?: boolean;
  error?: string | null;
}

export function RecommendationResults({ wines, recommendations, restaurantName, isLoading, error }: RecommendationResultsProps) {
  const wineLookup = new Map(wines.map((wine) => [wine.id, wine]));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-white/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#8b4049]">
          <WineIcon className="h-6 w-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Recommended for you</p>
        </div>
        {restaurantName ? (
          <div className="flex items-center gap-1 rounded-full bg-[#f2e8e2] px-3 py-1 text-xs text-[#5b3c37]">
            <MapPinIcon className="h-4 w-4" />
            {restaurantName}
          </div>
        ) : null}
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {isLoading ? <p className="text-sm text-[#5b5b5b]">Fetching recommendations...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec) => {
          const wine = wineLookup.get(rec.wineId);
          return (
            <article key={rec.wineId} className="flex h-full flex-col gap-3 rounded-2xl border border-[#e6dcd4] bg-white/70 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[#2c2c2c]">{wine?.name || rec.wineId}</p>
                  <p className="text-sm text-[#6b6b6b]">
                    {[wine?.producer, wine?.region, wine?.country].filter(Boolean).join(" • ") || wine?.rawText || "Parsed wine"}
                  </p>
                </div>
                <span className="rounded-full bg-[#8b4049]/10 px-3 py-1 text-sm font-semibold text-[#8b4049]">{Math.round(rec.score)}</span>
              </div>
              <p className="text-sm text-[#4a4a4a]">{rec.reason}</p>
              {rec.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {rec.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#f2e8e2] px-3 py-1 text-xs text-[#5b3c37]">
                      <SparklesIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {wine?.price ? (
                <p className="text-sm text-[#5b5b5b]">{wine.price} {wine.currency ?? "USD"}</p>
              ) : null}
            </article>
          );
        })}
      </div>

      {recommendations.length === 0 && !isLoading ? (
        <p className="text-sm text-[#5b5b5b]">No recommendations yet. Upload a menu and try again.</p>
      ) : null}
    </div>
  );
}
