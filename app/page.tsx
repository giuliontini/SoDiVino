"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { WinePersona, UserPreferences } from "@/lib/cellarTypes";
import type { WineItem, WineRecommendation } from "@/lib/wineTypes";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { LandingPage } from "./components/figma/landing-page";
import { PreferencesPayload, PreferencesStep } from "./components/figma/preferences-step";
import { PersonaSelector } from "./components/figma/persona-selector";
import { WineUpload } from "./components/figma/wine-upload";
import { RecommendationView, ResultsPage } from "./components/figma/results-page";
import { WineDetailsModal } from "./components/figma/wine-details-modal";

type ParseMenuResponse = {
  wines?: WineItem[];
  listId?: string;
  parsedListId?: string;
  error?: string;
  message?: string;
};

type Stage = "preferences" | "persona" | "upload" | "results";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [personas, setPersonas] = useState<WinePersona[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("preferences");
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [parsedListId, setParsedListId] = useState<string | null>(null);
  const [parsedWines, setParsedWines] = useState<WineItem[]>([]);
  const [recommendations, setRecommendations] = useState<WineRecommendation[] | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showingWine, setShowingWine] = useState<RecommendationView | null>(null);

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

        const personaList: WinePersona[] = personasJson.personas ?? [];
        if (!cancelled) {
          setPersonas(personaList);
          const defaultPersona =
            personaList.find((p) => p.is_default) ?? (personaList.length > 0 ? personaList[0] : null);
          setSelectedPersonaId(defaultPersona?.id ?? null);
        }

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

        if (!cancelled) {
          setIsAuthenticated(true);
          setStage("preferences");
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
  const wineLookup = useMemo(() => {
    const map = new Map<string, WineItem>();
    parsedWines.forEach((wine) => map.set(wine.id, wine));
    return map;
  }, [parsedWines]);

  const recommendationViews: RecommendationView[] = useMemo(
    () =>
      (recommendations ?? []).map((rec) => {
        const wine = wineLookup.get(rec.wineId);
        return {
          id: rec.wineId,
          name: wine?.name ?? "Menu wine",
          producer: wine?.producer,
          region: wine?.region,
          country: wine?.country,
          grape: wine?.grape,
          vintage: wine?.vintage,
          price: wine?.price,
          currency: wine?.currency,
          reason: rec.reason,
          tags: rec.tags ?? [],
          score: rec.score,
          rawText: wine?.rawText ?? "Listed wine from the menu",
        } satisfies RecommendationView;
      }),
    [recommendations, wineLookup]
  );

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    setIsAuthenticated(false);
    router.push("/login");
  }

  async function handleSavePreferences(payload: PreferencesPayload) {
    setIsSavingPreferences(true);
    setError(null);
    try {
      const res = await fetch("/api/user-prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save preferences");
      }
      setPreferences(json.preferences ?? payload);
      setStage("persona");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save preferences";
      setError(message);
    } finally {
      setIsSavingPreferences(false);
    }
  }

  function handleSelectPersona(personaId: string) {
    setSelectedPersonaId(personaId);
    setStage("upload");
    setRecommendations(null);
    setParsedListId(null);
    setParsedWines([]);
    setStatusMessage(null);
    setError(null);
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
      const res = await fetch("/api/parse-menu-image", { method: "POST", body: formData });
      const json: ParseMenuResponse = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to parse menu");
      }

      const wines = Array.isArray(json.wines) ? json.wines : [];
      setParsedWines(wines);
      setParsedListId(json.listId || json.parsedListId || null);
      setStatusMessage(json.message || `Parsed ${wines.length} wines from the menu.`);
      await handleGetRecommendations(json.listId || json.parsedListId || null, wines);
      setStage("results");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse menu";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGetRecommendations(listId: string | null = parsedListId, wines: WineItem[] = parsedWines) {
    if (!selectedPersonaId) {
      setError("Choose a persona before asking for recommendations.");
      return;
    }
    if (!listId && wines.length === 0) {
      setError("Upload and parse a menu first.");
      return;
    }

    setIsRecommending(true);
    setError(null);
    setStatusMessage("Crafting AI pairings…");

    const payload: Record<string, unknown> = { personaIds: [selectedPersonaId] };
    if (listId) {
      payload.parsedListId = listId;
    } else {
      payload.wines = wines;
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
      setStatusMessage("Ready — here are your pairings.");
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
          Preparing the So DiVino Figma experience…
        </div>
      </main>
    );
  }

  if (isAuthenticated === false) {
    return <LandingPage onStart={() => router.push("/login")} onLogin={() => router.push("/login")} onSignup={() => router.push("/signup")} />;
  }

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId) ?? null;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6] text-[#1f1f1f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.08),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(139,64,73,0.08),transparent_40%)]" />
      <div className="relative z-10">
        <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8b4049]">So DiVino</p>
            <h1 className="text-2xl font-semibold">AI Wine Concierge</h1>
            <p className="text-sm text-[#6b6b6b]">Figma flow wired to your Supabase session and API stack.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#6b6b6b]">
            {friendlyName && <span className="rounded-full bg-[#8b4049]/10 px-4 py-2 text-[#8b4049]">Welcome {friendlyName}</span>}
            <button onClick={handleSignOut} className="rounded-full border border-transparent bg-[#1f1f1f] px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              Sign out
            </button>
          </div>
        </header>

        {stage === "preferences" && (
          <PreferencesStep
            preferences={preferences}
            onSubmit={handleSavePreferences}
            onSkip={() => setStage("persona")}
            loading={loadingData}
            submitting={isSavingPreferences}
            error={error}
          />
        )}

        {stage === "persona" && (
          <PersonaSelector
            personas={personas}
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={handleSelectPersona}
            loading={loadingData}
          />
        )}

        {stage === "upload" && selectedPersona && (
          <WineUpload
            personaName={selectedPersona.name}
            restaurantName={restaurantName}
            onRestaurantChange={setRestaurantName}
            menuFile={menuFile}
            onFileSelected={handleFileSelected}
            onUpload={handleUpload}
            isUploading={isUploading}
            statusMessage={statusMessage}
            error={error}
          />
        )}

        {stage === "results" && selectedPersona && (
          <ResultsPage
            personaName={selectedPersona.name}
            recommendations={recommendationViews}
            onWineSelect={setShowingWine}
            onChangePersona={() => setStage("persona")}
            onUploadAnother={() => setStage("upload")}
          />
        )}

        {(isRecommending || isUploading) && (
          <div className="fixed bottom-6 right-6 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm text-[#6b6b6b] shadow-lg backdrop-blur">
            {isUploading ? "Parsing menu…" : "Generating recommendations…"}
          </div>
        )}

        <WineDetailsModal wine={showingWine} isOpen={Boolean(showingWine)} onClose={() => setShowingWine(null)} />
      </div>
    </div>
  );
}
