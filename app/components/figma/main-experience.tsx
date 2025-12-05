"use client";

import { type ChangeEvent, type DragEvent, useMemo, useState } from "react";
import Link from "next/link";
import type { WinePersona, UserPreferences } from "@/lib/cellarTypes";
import type { WineItem, WineRecommendation } from "@/lib/wineTypes";

interface MainExperienceProps {
  personas: WinePersona[];
  preferences: UserPreferences | null;
  friendlyName: string | null;
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
  restaurantName: string;
  onRestaurantChange: (value: string) => void;
  menuFile: File | null;
  onFileSelected: (file: File | null) => void;
  onUpload: () => Promise<void>;
  onRequestRecommendations: () => Promise<void>;
  isUploading: boolean;
  isRecommending: boolean;
  parsedListId: string | null;
  parsedWines: WineItem[];
  recommendations: WineRecommendation[] | null;
  statusMessage: string | null;
  error: string | null;
  onSignOut: () => Promise<void> | void;
}

export function MainExperience({
  personas,
  preferences,
  friendlyName,
  selectedPersonaId,
  onSelectPersona,
  restaurantName,
  onRestaurantChange,
  menuFile,
  onFileSelected,
  onUpload,
  onRequestRecommendations,
  isUploading,
  isRecommending,
  parsedListId,
  parsedWines,
  recommendations,
  statusMessage,
  error,
  onSignOut,
}: MainExperienceProps) {
  const [isDragging, setIsDragging] = useState(false);

  const wineLookup = useMemo(() => {
    const map = new Map<string, WineItem>();
    parsedWines.forEach((wine) => map.set(wine.id, wine));
    return map;
  }, [parsedWines]);

  const selectedPersona = personas.find((persona) => persona.id === selectedPersonaId) ?? null;
  const hasMenu = parsedWines.length > 0 || Boolean(parsedListId);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    onFileSelected(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) {
      onFileSelected(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6] text-[#1f1f1f]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/80 bg-white/70 px-6 py-5 shadow-xl shadow-black/5 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8b4049]">So DiVino</p>
            <h1 className="text-2xl font-semibold">AI Wine Concierge</h1>
            <p className="text-sm text-[#6b6b6b]">
              Upload menus, pick your persona, and let the agent handle the pairing logic.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#6b6b6b]">
            {friendlyName && <span className="rounded-full bg-[#8b4049]/10 px-4 py-2 text-[#8b4049]">Welcome back {friendlyName}</span>}
            <Link
              href="/cellar"
              className="rounded-full border border-[#d4af37]/60 bg-white px-4 py-2 font-semibold text-[#8b4049] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4af37]"
            >
              Open cellar
            </Link>
            <button
              onClick={onSignOut}
              className="rounded-full border border-transparent bg-[#1f1f1f] px-4 py-2 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}
        {statusMessage && (
          <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#6b4a1f] shadow-sm">
            {statusMessage}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <PersonaRail personas={personas} selectedPersonaId={selectedPersonaId} onSelectPersona={onSelectPersona} />

            <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-black/5 backdrop-blur-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Menu photo</p>
                  <h2 className="text-xl font-semibold">Upload and parse</h2>
                  <p className="text-sm text-[#6b6b6b]">Drop a menu image and we will translate it into structured wines.</p>
                </div>
                {parsedListId && (
                  <span className="rounded-full bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold text-[#6b4a1f]">
                    Parsed list {parsedListId}
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  <label className="text-sm text-[#6b6b6b]">
                    Restaurant (optional)
                    <input
                      className="mt-2 w-full rounded-2xl border border-[#e4dcd2] bg-white px-4 py-3 text-sm shadow-inner focus:border-[#8b4049] focus:outline-none"
                      value={restaurantName}
                      onChange={(event) => onRestaurantChange(event.target.value)}
                      placeholder="e.g. Balthazar"
                    />
                  </label>
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${
                      isDragging ? "border-[#8b4049]/80 bg-[#8b4049]/5" : "border-[#e4dcd2] bg-white"
                    }`}
                  >
                    <input className="hidden" type="file" accept="image/*" onChange={handleFileInput} />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">
                      📷
                    </div>
                    <p className="mt-3 font-semibold">Drop a menu photo or click to browse</p>
                    <p className="text-sm text-[#6b6b6b]">
                      High contrast photos work best. JPG and PNG are supported.
                    </p>
                    {menuFile && <p className="mt-2 text-sm text-[#8b4049]">Selected: {menuFile.name}</p>}
                  </label>
                </div>

                <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-[#e4dcd2] bg-white p-4 shadow-inner">
                  <div className="space-y-2 text-sm text-[#6b6b6b]">
                    <p className="font-semibold text-[#2c2c2c]">Workflow</p>
                    <ol className="space-y-2 text-sm">
                      <li>1. Choose your persona.</li>
                      <li>2. Upload a clear menu photo.</li>
                      <li>3. Ask the agent for ranked recommendations.</li>
                    </ol>
                    <p className="text-xs text-[#8b4049]">
                      Parsed {parsedWines.length} wines {parsedListId ? "from stored list." : "from the uploaded menu."}
                    </p>
                  </div>
                  <button
                    onClick={onUpload}
                    disabled={isUploading}
                    className="w-full rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8b4049]/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isUploading ? "Analyzing menu…" : "Analyze menu"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-black/5 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Preferences</p>
                  <h3 className="text-lg font-semibold">Taste profile</h3>
                </div>
                <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#6b4a1f]">Live</span>
              </div>
              {preferences ? (
                <dl className="mt-4 space-y-2 text-sm text-[#2c2c2c]">
                  <div className="flex justify-between rounded-2xl bg-[#f8f5f2] px-3 py-2">
                    <dt className="text-[#6b6b6b]">Risk tolerance</dt>
                    <dd className="font-semibold">{preferences.risk_tolerance}</dd>
                  </div>
                  <div className="flex justify-between rounded-2xl bg-[#f8f5f2] px-3 py-2">
                    <dt className="text-[#6b6b6b]">Quality tier</dt>
                    <dd className="font-semibold">{preferences.quality_tier}</dd>
                  </div>
                  <div className="flex justify-between rounded-2xl bg-[#f8f5f2] px-3 py-2">
                    <dt className="text-[#6b6b6b]">Budget</dt>
                    <dd className="font-semibold">
                      {preferences.usual_budget_min ?? "?"} – {preferences.usual_budget_max ?? "?"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-[#6b6b6b]">No saved preferences yet. Set them in your cellar to guide the agent.</p>
              )}
              {selectedPersona && (
                <div className="mt-4 rounded-2xl border border-[#e4dcd2] bg-[#fdfbf8] p-3 text-sm text-[#2c2c2c]">
                  <p className="font-semibold">Persona: {selectedPersona.name}</p>
                  <p className="text-[#6b6b6b]">{selectedPersona.color} • {selectedPersona.body}-bodied • {selectedPersona.grapes.join(", ")}</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-black/5 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Recommendations</p>
                  <h3 className="text-lg font-semibold">Ask the agent</h3>
                </div>
                <span className="rounded-full bg-[#8b4049]/10 px-3 py-1 text-xs font-semibold text-[#8b4049]">
                  {recommendations ? `${recommendations.length} returned` : "Ready"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#6b6b6b]">
                We score wines from your parsed menu against the active persona and saved preferences.
              </p>
              <button
                onClick={onRequestRecommendations}
                disabled={!hasMenu || !selectedPersonaId || isRecommending}
                className="mt-4 w-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#8b4049] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8b4049]/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRecommending ? "Scoring wines…" : "Get ranked recommendations"}
              </button>
              <RecommendationList recommendations={recommendations} wineLookup={wineLookup} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PersonaRail({
  personas,
  selectedPersonaId,
  onSelectPersona,
}: {
  personas: WinePersona[];
  selectedPersonaId: string | null;
  onSelectPersona: (id: string) => void;
}) {
  if (personas.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#e4dcd2] bg-white/60 p-6 text-center shadow-inner">
        <p className="text-sm text-[#6b6b6b]">No personas yet. Create one in your cellar to unlock ranked recommendations.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-xl shadow-black/5 backdrop-blur-lg">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Personas</p>
          <h2 className="text-lg font-semibold">Choose your vibe</h2>
        </div>
        <span className="text-xs text-[#6b6b6b]">{personas.length} available</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {personas.map((persona) => {
          const isSelected = persona.id === selectedPersonaId;
          return (
            <button
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              className={`min-w-[220px] flex-1 rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                isSelected
                  ? "border-[#8b4049] bg-gradient-to-br from-[#8b4049]/10 to-[#d4af37]/15"
                  : "border-[#e4dcd2] bg-white hover:-translate-y-0.5 hover:shadow"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[#2c2c2c]">{persona.name}</p>
                {persona.is_default && (
                  <span className="rounded-full bg-[#d4af37]/20 px-2 py-1 text-[11px] font-semibold text-[#6b4a1f]">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#6b6b6b]">
                {persona.color} • {persona.body}-bodied • {persona.min_price ?? "?"} – {persona.max_price ?? "?"}
              </p>
              {persona.grapes.length > 0 && (
                <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#6b6b6b]">
                  Grapes: {persona.grapes.join(", ")}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecommendationList({
  recommendations,
  wineLookup,
}: {
  recommendations: WineRecommendation[] | null;
  wineLookup: Map<string, WineItem>;
}) {
  if (!recommendations) return null;

  if (recommendations.length === 0) {
    return <p className="mt-4 text-sm text-[#6b6b6b]">No results yet. Upload a menu and try again.</p>;
  }

  return (
    <div className="mt-4 space-y-3">
      {recommendations.map((rec, index) => {
        const wine = wineLookup.get(rec.wineId);
        return (
          <article
            key={rec.wineId}
            className="rounded-2xl border border-[#e4dcd2] bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#2c2c2c]">
                  {index + 1}. {wine?.name ?? "Wine"}
                </p>
                {wine?.rawText && <p className="text-xs text-[#6b6b6b]">{wine.rawText}</p>}
                <p className="mt-2 text-xs text-[#8b4049]">Score: {rec.score}%</p>
              </div>
              <div className="rounded-full bg-[#8b4049]/10 px-3 py-1 text-xs font-semibold text-[#8b4049]">{rec.wineId}</div>
            </div>
            <p className="mt-2 text-sm text-[#2c2c2c]">{rec.reason}</p>
            {rec.tags && rec.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {rec.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-[11px] font-semibold text-[#6b4a1f]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
