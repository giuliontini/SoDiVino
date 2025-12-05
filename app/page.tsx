"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WinePersona, UserPreferences } from "@/lib/cellarTypes";
import type { WineItem, WineRecommendation } from "@/lib/wineTypes";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { LandingHero } from "./components/figma/landing-hero";
import { MainExperience } from "./components/figma/main-experience";

type ParseMenuResponse = {
  wines?: WineItem[];
  listId?: string;
  parsedListId?: string;
  error?: string;
  message?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [personas, setPersonas] = useState<WinePersona[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [parsedListId, setParsedListId] = useState<string | null>(null);
  const [parsedWines, setParsedWines] = useState<WineItem[]>([]);
  const [recommendations, setRecommendations] = useState<WineRecommendation[] | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: userData, error: userError } = await supabaseBrowser.auth.getUser();
        if (userError || !userData?.user) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setLoadingData(false);
          }
          return;
        }

        if (!cancelled) {
          setDisplayName(userData.user.user_metadata?.display_name ?? null);
          setUserEmail(userData.user.email ?? null);
        }

        const personasRes = await fetch("/api/personas");
        if (personasRes.status === 401) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setLoadingData(false);
          }
          return;
        }

        const personasJson = await personasRes.json();
        if (!personasRes.ok) {
          throw new Error(personasJson.error || "Failed to load personas");
        }

        if (cancelled) return;

        const personaList = personasJson.personas ?? [];
        setPersonas(personaList);
        const defaultPersona =
          personaList.find((p: WinePersona) => p.is_default) ?? (personaList.length > 0 ? personaList[0] : null);
        setSelectedPersonaId(defaultPersona?.id ?? null);
        setIsAuthenticated(true);

        const prefsRes = await fetch("/api/user-prefs");
        if (prefsRes.status === 401) {
          if (!cancelled) {
            setIsAuthenticated(false);
          }
          return;
        }
        if (prefsRes.ok) {
          const prefsJson = await prefsRes.json();
          if (!cancelled) {
            setPreferences(prefsJson.preferences ?? null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load data";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const friendlyName = displayName || userEmail;

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    setIsAuthenticated(false);
    router.push("/login");
  }

  function handleFileSelected(file: File | null) {
    setMenuFile(file);
    setStatusMessage(null);
    setError(null);
  }

  async function handleUpload() {
    if (!menuFile) {
      setError("Upload a menu photo to analyze.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setStatusMessage("Analyzing menu image…");
    setRecommendations(null);
    setParsedListId(null);

    const formData = new FormData();
    formData.append("file", menuFile);
    if (restaurantName.trim()) {
      formData.append("restaurantName", restaurantName.trim());
    }

    try {
      const res = await fetch("/api/parse-menu-image", {
        method: "POST",
        body: formData,
      });
      const json: ParseMenuResponse = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to parse menu");
      }

      const wines = Array.isArray(json.wines) ? json.wines : [];
      setParsedWines(wines);
      setParsedListId(json.listId || json.parsedListId || null);
      setStatusMessage(json.message || `Parsed ${wines.length} wines from the menu.`);
      setRecommendations(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse menu";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGetRecommendations() {
    if (!selectedPersonaId) {
      setError("Choose a persona before asking for recommendations.");
      return;
    }
    if (!parsedListId && parsedWines.length === 0) {
      setError("Upload and parse a menu first.");
      return;
    }

    setIsRecommending(true);
    setError(null);
    setStatusMessage(null);

    const payload: Record<string, unknown> = { personaIds: [selectedPersonaId] };
    if (parsedListId) {
      payload.parsedListId = parsedListId;
    } else {
      payload.wines = parsedWines;
    }

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch recommendations");
      }

      setRecommendations(json.recommendations ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch recommendations";
      setError(message);
    } finally {
      setIsRecommending(false);
    }
  }

  if (loadingData && isAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6] text-[#2c2c2c]">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-4 text-sm text-[#6b6b6b] shadow-lg backdrop-blur">
          Preparing the refreshed So DiVino experience…
        </div>
      </main>
    );
  }

  if (isAuthenticated === false) {
    return <LandingHero onLogin={() => router.push("/login")} onSignup={() => router.push("/signup")} />;
  }

  return (
    <MainExperience
      personas={personas}
      preferences={preferences}
      friendlyName={friendlyName}
      selectedPersonaId={selectedPersonaId}
      onSelectPersona={setSelectedPersonaId}
      restaurantName={restaurantName}
      onRestaurantChange={setRestaurantName}
      menuFile={menuFile}
      onFileSelected={handleFileSelected}
      onUpload={handleUpload}
      onRequestRecommendations={handleGetRecommendations}
      isUploading={isUploading}
      isRecommending={isRecommending}
      parsedListId={parsedListId}
      parsedWines={parsedWines}
      recommendations={recommendations}
      statusMessage={statusMessage}
      error={error}
      onSignOut={handleSignOut}
    />
  );
}
