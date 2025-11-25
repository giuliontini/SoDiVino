// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WinePersona, UserPreferences } from "@/lib/cellarTypes";
import type { WineItem, WineRecommendation } from "@/lib/wineTypes";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

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

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    setIsAuthenticated(false);
    router.push("/login");
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

  const wineLookup = useMemo(() => {
    const map = new Map<string, WineItem>();
    parsedWines.forEach((wine) => map.set(wine.id, wine));
    return map;
  }, [parsedWines]);

  const hasMenu = parsedWines.length > 0 || Boolean(parsedListId);

  if (loadingData && isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading Wine Menu Agent…</p>
      </main>
    );
  }

  if (isAuthenticated === false) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full space-y-4 text-center">
          <h1 className="text-3xl font-semibold">Wine Menu Agent</h1>
          <p className="text-lg text-slate-300">
            Sign up or log in to define your cellar and get personalized wine recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="inline-flex justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Wine Menu Agent</p>
            <h1 className="text-3xl font-semibold">Define your cellar, parse the menu, get the perfect pour.</h1>
            <p className="text-slate-300">
              Build personas for your taste, upload a wine list photo, and let AI highlight the best matches.
            </p>
            {preferences && (
              <p className="text-sm text-slate-400">
                Global preferences: {preferences.risk_tolerance} • {preferences.quality_tier} • Budget{" "}
                {preferences.usual_budget_min ?? "?"} - {preferences.usual_budget_max ?? "?"}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/cellar"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-900"
            >
              Manage my Cellar
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>
        </header>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {statusMessage && <p className="text-sm text-indigo-300">{statusMessage}</p>}

        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quick persona selector</h2>
                <span className="text-xs text-slate-400">{personas.length} personas</span>
              </div>
              {personas.length === 0 ? (
                <p className="text-sm text-slate-400">No personas yet. Create one in your cellar to get started.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {personas.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersonaId(persona.id)}
                      className={`rounded-lg border p-3 text-left transition ${
                        selectedPersonaId === persona.id
                          ? "border-indigo-500 bg-slate-800/70"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{persona.name}</span>
                        {persona.is_default && (
                          <span className="text-[11px] rounded-full border border-green-500 text-green-400 px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {persona.color} • {persona.body}-bodied • {persona.min_price ?? "?"} -{" "}
                        {persona.max_price ?? "?"}
                      </p>
                      {persona.grapes.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1 truncate">
                          Grapes: {persona.grapes.join(", ")}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu photo upload</h2>
                {parsedListId && <span className="text-xs text-slate-400">List id: {parsedListId}</span>}
              </div>
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <label className="text-sm flex flex-col">
                  Restaurant (optional)
                  <input
                    className="mt-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g. Balthazar"
                  />
                </label>
                <label className="text-sm flex flex-col">
                  Menu photo
                  <input
                    className="mt-1 text-sm text-slate-200"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMenuFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-500 disabled:opacity-70"
                >
                  {isUploading ? "Uploading…" : "Upload & analyze"}
                </button>
                {hasMenu && (
                  <span className="text-xs text-slate-400">
                    Parsed {parsedWines.length} items{parsedListId ? ` • list ${parsedListId}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold">Get AI recommendations</h2>
            <p className="text-sm text-slate-400">
              Select a persona, upload a menu, then ask the agent to rank wines for you.
            </p>
            <button
              onClick={handleGetRecommendations}
              disabled={!hasMenu || !selectedPersonaId || isRecommending}
              className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60"
            >
              {isRecommending ? "Scoring wines…" : "Get recommendations"}
            </button>
            {recommendations && recommendations.length === 0 && (
              <p className="text-sm text-slate-400">No recommendations returned yet.</p>
            )}
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => {
                  const wine = wineLookup.get(rec.wineId);
                  return (
                    <div key={rec.wineId} className="rounded-lg border border-slate-800 p-3 bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {idx + 1}. {wine?.name ?? "Wine"}{" "}
                            <span className="text-xs text-slate-500">({rec.wineId})</span>
                          </p>
                          {wine?.rawText && <p className="text-xs text-slate-400 mt-1">{wine.rawText}</p>}
                        </div>
                        <span className="text-xs rounded-full border border-emerald-500 text-emerald-300 px-2 py-0.5">
                          {rec.score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2">{rec.reason}</p>
                      {rec.tags?.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1">Tags: {rec.tags.join(", ")}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
