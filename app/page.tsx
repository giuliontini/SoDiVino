// app/page.tsx
"use client";

import { useEffect, useState } from "react";

type WineProfile = {
  id: string;
  label: string;
  description: string;
  color: string;
  body: string;
  sweetness: string;
  acidity: string;
  budget: number;
};

type ApiTopItem = {
  wine: {
    name: string;
    color: string;
    body: string;
    sweetness: string;
    acidity: string;
    price: number | null;
    notes?: string;
  };
  score: number;
  reasons: string[];
};

export default function HomePage() {
  const [profiles, setProfiles] = useState<WineProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [dislikes, setDislikes] = useState<string>("");
  const [adventurous, setAdventurous] = useState<string>("3");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<ApiTopItem[]>([]);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/preferences")
      .then((res) => res.json())
      .then((data: WineProfile[]) => {
        setProfiles(data);
        if (data.length > 0) {
          setSelectedProfileId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  async function handleAnalyze() {
    if (!image) {
      setStatus("Please upload a photo of the wine menu.");
      return;
    }
    if (!selectedProfileId) {
      setStatus("Please select a wine profile.");
      return;
    }

    setLoading(true);
    setStatus("Analyzing menu (OCR)… This can take a few seconds.");
    setResults([]);
    setParsedCount(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("profileId", selectedProfileId);
    if (budget.trim() !== "") formData.append("budget", budget.trim());
    formData.append("dislikes", dislikes);
    formData.append("adventurous", adventurous || "3");

    try {
      const res = await fetch("/api/recommend-from-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error || res.statusText}`);
        return;
      }

      if (!data.top || data.top.length === 0) {
        setStatus(data.message || "No wines parsed from the menu.");
        setParsedCount(data.parsedCount ?? null);
        return;
      }

      setStatus(`Parsed ${data.parsedCount} wines. Showing top ${data.top.length} suggestions.`);
      setResults(data.top);
      setParsedCount(data.parsedCount ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setStatus("Unexpected error: " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-slate-900 text-slate-50 p-4">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
        <h1 className="text-2xl font-semibold">Wine Menu Agent 🍷</h1>
        <p className="text-sm text-slate-400">
          Upload a photo of the restaurant&apos;s wine list, choose your profile, and get a bottle
          recommendation.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Wine profile</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {selectedProfile && (
              <p className="text-xs text-slate-400 mt-1">
                {selectedProfile.description} (color: {selectedProfile.color}, budget ~
                {selectedProfile.budget})
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Max budget</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                placeholder={`Use profile (${selectedProfile?.budget ?? "?"})`}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                type="number"
                min={0}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Things to avoid (comma-separated)</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                placeholder="e.g. oaky, cabernet, tannic"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3 items-end">
            <div>
              <label className="block text-sm mb-1">Adventurous level (0–10)</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                value={adventurous}
                onChange={(e) => setAdventurous(e.target.value)}
                type="number"
                min={0}
                max={10}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Menu photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="text-xs"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 px-4 py-2 text-sm font-medium"
          >
            {loading ? "Analyzing…" : "Analyze menu"}
          </button>

          {status && <p className="text-xs text-slate-300">{status}</p>}
        </div>

        {results.length > 0 && (
          <div className="mt-4 border-t border-slate-800 pt-3 space-y-3">
            <h2 className="text-lg font-semibold">Top suggestions</h2>
            {results.map((item, idx) => (
              <div key={idx} className="border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">
                    {idx + 1}. {item.wine.name}
                  </div>
                  <span className="text-xs border border-slate-700 rounded-full px-2 py-0.5">
                    Score: {item.score.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {item.wine.color}, {item.wine.body}-bodied, {item.wine.sweetness},{" "}
                  {item.wine.acidity} acidity
                  {item.wine.price != null && <> • {item.wine.price}</>}
                </div>
                {item.reasons?.length > 0 && (
                  <div className="text-xs text-slate-400 mt-1">
                    Why this wine: {item.reasons.join("; ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {parsedCount !== null && results.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Parsed wines: {parsedCount}. None scored highly enough or parsing needs tuning.
          </p>
        )}
      </div>
    </main>
  );
}
