"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecommendationResults } from "../components/RecommendationResults";
import type { WineRecommendation, WineItem } from "@/lib/wineTypes";
import type { MenuSession } from "@/lib/menuSessions";
import type { TasteProfile } from "@/lib/tasteProfiles";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function RecommendationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");
  const parsedListFromUrl = searchParams.get("parsedListId");
  const restaurantFromUrl = searchParams.get("restaurant");

  const [session, setSession] = useState<MenuSession | null>(null);
  const [wines, setWines] = useState<WineItem[]>([]);
  const [recommendations, setRecommendations] = useState<WineRecommendation[]>([]);
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parsedListId = useMemo(() => parsedListFromUrl || session?.parsed_list_id || null, [parsedListFromUrl, session]);
  const restaurantName = restaurantFromUrl || session?.restaurant_name || null;

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const [sessionRes, profileRes] = await Promise.all([
          fetch(sessionIdFromUrl ? `/api/menu-sessions?id=${sessionIdFromUrl}` : "/api/menu-sessions"),
          fetch("/api/taste-profiles"),
        ]);

        if (sessionRes.status === 401 || profileRes.status === 401) {
          router.push("/login");
          return;
        }

        const sessionJson = await sessionRes.json();
        const profileJson = await profileRes.json();
        if (!cancelled) {
          setSession(sessionJson.session ?? null);
          setProfile(profileJson.profile ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load session");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router, sessionIdFromUrl]);

  useEffect(() => {
    let cancelled = false;
    async function loadWines() {
      if (!parsedListId) return;
      const res = await fetch(`/api/parsed-wines?parsedListId=${parsedListId}`);
      const json = await res.json();
      if (!cancelled) {
        if (res.ok) {
          setWines(Array.isArray(json.wines) ? json.wines : []);
        } else {
          setError(json.error || "Failed to load wines");
        }
      }
    }
    loadWines();
    return () => {
      cancelled = true;
    };
  }, [parsedListId]);

  useEffect(() => {
    let cancelled = false;
    async function loadRecommendations() {
      if (!profile || !parsedListId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasteProfileId: profile.id, parsedListId }),
        });
        const json = await res.json();
        if (!cancelled) {
          if (!res.ok) {
            throw new Error(json.error || "Failed to fetch recommendations");
          }
          setRecommendations(Array.isArray(json.recommendations) ? json.recommendations : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [parsedListId, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f3ed] via-white to-[#f3e8e1] px-4 py-10 text-[#2c2c2c]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Recommendations</p>
          <h1 className="text-3xl font-serif text-[#2c2c2c]">Your matches are ready</h1>
          <p className="text-[#5c5c5c]">We pair your saved taste profile with tonight&apos;s menu session.</p>
        </div>

        {!profile ? (
          <div className="rounded-2xl bg-white/70 p-4 text-center text-sm text-[#5b5b5b]">
            No taste profile found. Start with onboarding.
            <button
              type="button"
              className="ml-2 text-[#8b4049] underline"
              onClick={() => router.push("/onboarding")}
            >
              Go to onboarding
            </button>
          </div>
        ) : null}

        <RecommendationResults
          wines={wines}
          recommendations={recommendations}
          restaurantName={restaurantName}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
