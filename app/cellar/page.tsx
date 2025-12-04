"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  WinePersona,
  UserPreferences,
  bodyLevels,
  intensityLevels,
  qualityTiers,
  riskToleranceLevels,
  sweetnessLevels,
  wineColors
} from "@/lib/cellarTypes";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

interface PersonaFormState {
  id?: string;
  name: string;
  color: string;
  grapes: string;
  body: string;
  tannin: string;
  acidity: string;
  sweetness: string;
  food_pairing_tags: string;
  min_price: string;
  max_price: string;
  notes: string;
  is_default: boolean;
}

const emptyPersonaForm: PersonaFormState = {
  name: "",
  color: "any",
  grapes: "",
  body: "unknown",
  tannin: "unknown",
  acidity: "unknown",
  sweetness: "unknown",
  food_pairing_tags: "",
  min_price: "",
  max_price: "",
  notes: "",
  is_default: false
};

interface PreferencesFormState {
  favorite_grapes: string;
  quality_tier: string;
  usual_budget_min: string;
  usual_budget_max: string;
  risk_tolerance: string;
}

const emptyPreferences: PreferencesFormState = {
  favorite_grapes: "",
  quality_tier: "value",
  usual_budget_min: "",
  usual_budget_max: "",
  risk_tolerance: "safe"
};

export default function CellarPage() {
  const [personas, setPersonas] = useState<WinePersona[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [personaForm, setPersonaForm] = useState<PersonaFormState>(emptyPersonaForm);
  const [preferencesForm, setPreferencesForm] = useState<PreferencesFormState>(emptyPreferences);
  const [loading, setLoading] = useState(true);
  const [savingPersona, setSavingPersona] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const defaultPersonaId = useMemo(() => personas.find((p) => p.is_default)?.id, [personas]);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: userData, error: userError }, personaRes, prefsRes] = await Promise.all([
          supabaseBrowser.auth.getUser(),
          fetch("/api/personas"),
          fetch("/api/user-prefs")
        ]);

        if (userError) {
          throw new Error(userError.message);
        }

        if (userData?.user) {
          setDisplayName(userData.user.user_metadata?.display_name ?? null);
          setUserEmail(userData.user.email ?? null);
        }

        const personaJson = await personaRes.json();
        const prefsJson = await prefsRes.json();

        if (!personaRes.ok) throw new Error(personaJson.error || "Failed to load personas");
        if (!prefsRes.ok) throw new Error(prefsJson.error || "Failed to load preferences");

        setPersonas(personaJson.personas ?? []);
        setPreferences(prefsJson.preferences ?? null);
        if (prefsJson.preferences) {
          setPreferencesForm({
            favorite_grapes: prefsJson.preferences.favorite_grapes?.join(", ") ?? "",
            quality_tier: prefsJson.preferences.quality_tier ?? "value",
            usual_budget_min:
              prefsJson.preferences.usual_budget_min !== null && prefsJson.preferences.usual_budget_min !== undefined
                ? String(prefsJson.preferences.usual_budget_min)
                : "",
            usual_budget_max:
              prefsJson.preferences.usual_budget_max !== null && prefsJson.preferences.usual_budget_max !== undefined
                ? String(prefsJson.preferences.usual_budget_max)
                : "",
            risk_tolerance: prefsJson.preferences.risk_tolerance ?? "safe"
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function startEditPersona(persona: WinePersona) {
    setPersonaForm({
      id: persona.id,
      name: persona.name,
      color: persona.color,
      grapes: persona.grapes.join(", "),
      body: persona.body,
      tannin: persona.tannin,
      acidity: persona.acidity,
      sweetness: persona.sweetness,
      food_pairing_tags: persona.food_pairing_tags.join(", "),
      min_price: persona.min_price?.toString() ?? "",
      max_price: persona.max_price?.toString() ?? "",
      notes: persona.notes ?? "",
      is_default: persona.is_default
    });
  }

  function resetPersonaForm() {
    setPersonaForm(emptyPersonaForm);
  }

  async function handlePersonaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingPersona(true);
    setError(null);

    const payload = {
      name: personaForm.name.trim(),
      color: personaForm.color,
      grapes: personaForm.grapes,
      body: personaForm.body,
      tannin: personaForm.tannin,
      acidity: personaForm.acidity,
      sweetness: personaForm.sweetness,
      food_pairing_tags: personaForm.food_pairing_tags,
      min_price: personaForm.min_price,
      max_price: personaForm.max_price,
      notes: personaForm.notes,
      is_default: personaForm.is_default
    };

    const isEditing = Boolean(personaForm.id);
    const url = isEditing ? `/api/personas/${personaForm.id}` : "/api/personas";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save persona");

      const saved = json.persona as WinePersona;
      setPersonas((prev) => {
        const others = prev.filter((p) => p.id !== saved.id);
        const withNew = [...others, saved];
        return withNew.sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
      resetPersonaForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save persona";
      setError(message);
    } finally {
      setSavingPersona(false);
    }
  }

  async function handleDeletePersona(id: string) {
    if (!confirm("Delete this persona?")) return;
    setError(null);
    const res = await fetch(`/api/personas/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to delete persona");
      return;
    }
    setPersonas((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSetDefault(persona: WinePersona) {
    setError(null);
    const res = await fetch(`/api/personas/${persona.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...persona, is_default: true })
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to set default");
      return;
    }
    const updated = json.persona as WinePersona;
    setPersonas((prev) => prev.map((p) => ({ ...p, is_default: p.id === updated.id })));
  }

  async function handlePreferencesSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingPrefs(true);
    setError(null);

    const payload = {
      favorite_grapes: preferencesForm.favorite_grapes,
      quality_tier: preferencesForm.quality_tier,
      usual_budget_min: preferencesForm.usual_budget_min,
      usual_budget_max: preferencesForm.usual_budget_max,
      risk_tolerance: preferencesForm.risk_tolerance
    };

    try {
      const res = await fetch("/api/user-prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save preferences");

      setPreferences(json.preferences as UserPreferences);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save preferences";
      setError(message);
    } finally {
      setSavingPrefs(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-50 p-6">
        <div className="max-w-5xl mx-auto">Loading cellar…</div>
      </main>
    );
  }

  const friendlyName = displayName || userEmail;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Cellar</h1>
            <p className="text-sm text-slate-400">Manage your wine personas and preferences.</p>
            {friendlyName && <p className="text-sm text-slate-400">Signed in as {friendlyName}.</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Back to menu
            </Link>
            <button
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
              onClick={resetPersonaForm}
            >
              New persona
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Your personas</h2>
            {personas.length === 0 && <p className="text-sm text-slate-400">No personas yet.</p>}
            <div className="space-y-3">
              {personas.map((persona) => (
                <div key={persona.id} className="border border-slate-800 rounded-lg p-3 bg-slate-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{persona.name}</div>
                      <p className="text-xs text-slate-400">
                        {persona.color} • {persona.body}-bodied • {persona.min_price ?? "?"} - {persona.max_price ?? "?"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Grapes: {persona.grapes.join(", ") || "Any"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {persona.is_default && (
                        <span className="text-[11px] rounded-full border border-green-500 text-green-400 px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <button
                      className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800"
                      onClick={() => startEditPersona(persona)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded border border-red-500 text-red-400 px-2 py-1 hover:bg-red-500 hover:text-white"
                      onClick={() => handleDeletePersona(persona.id)}
                    >
                      Delete
                    </button>
                    {!persona.is_default && (
                      <button
                        className="rounded border border-indigo-500 text-indigo-300 px-2 py-1 hover:bg-indigo-600 hover:text-white"
                        onClick={() => handleSetDefault(persona)}
                      >
                        Set default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950">
              <h2 className="text-lg font-semibold mb-2">{personaForm.id ? "Edit persona" : "New persona"}</h2>
              <PersonaForm
                form={personaForm}
                setForm={setPersonaForm}
                onSubmit={handlePersonaSubmit}
                onCancel={resetPersonaForm}
                saving={savingPersona}
              />
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950">
              <h2 className="text-lg font-semibold mb-2">Preferences</h2>
              <PreferencesForm
                form={preferencesForm}
                setForm={setPreferencesForm}
                onSubmit={handlePreferencesSubmit}
                saving={savingPrefs}
                defaultPersonaId={defaultPersonaId}
                preferences={preferences}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PersonaForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving
}: {
  form: PersonaFormState;
  setForm: (form: PersonaFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  function update<K extends keyof PersonaFormState>(key: K, value: PersonaFormState[K]) {
    setForm({ ...form, [key]: value });
  }

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm col-span-2">
          Name
          <input
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>
        <label className="text-sm">
          Color
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.color}
            onChange={(e) => update("color", e.target.value)}
            required
          >
            {wineColors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Body
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.body}
            onChange={(e) => update("body", e.target.value)}
          >
            {bodyLevels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tannin
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.tannin}
            onChange={(e) => update("tannin", e.target.value)}
          >
            {intensityLevels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Acidity
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.acidity}
            onChange={(e) => update("acidity", e.target.value)}
          >
            {intensityLevels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sweetness
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.sweetness}
            onChange={(e) => update("sweetness", e.target.value)}
          >
            {sweetnessLevels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm col-span-2">
          Grapes (comma separated)
          <input
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.grapes}
            onChange={(e) => update("grapes", e.target.value)}
            placeholder="e.g. cabernet, merlot"
          />
        </label>
        <label className="text-sm col-span-2">
          Food pairing tags
          <input
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.food_pairing_tags}
            onChange={(e) => update("food_pairing_tags", e.target.value)}
            placeholder="e.g. steak, pasta"
          />
        </label>
        <label className="text-sm">
          Min price
          <input
            type="number"
            min="0"
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.min_price}
            onChange={(e) => update("min_price", e.target.value)}
          />
        </label>
        <label className="text-sm">
          Max price
          <input
            type="number"
            min="0"
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.max_price}
            onChange={(e) => update("max_price", e.target.value)}
          />
        </label>
        <label className="text-sm col-span-2">
          Notes
          <textarea
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
          />
        </label>
        <label className="text-sm col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => update("is_default", e.target.checked)}
          />
          Set as default persona
        </label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save persona"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PreferencesForm({
  form,
  setForm,
  onSubmit,
  saving,
  defaultPersonaId,
  preferences
}: {
  form: PreferencesFormState;
  setForm: (form: PreferencesFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  defaultPersonaId?: string;
  preferences: UserPreferences | null;
}) {
  function update<K extends keyof PreferencesFormState>(key: K, value: PreferencesFormState[K]) {
    setForm({ ...form, [key]: value });
  }

  return (
    <form className="space-y-2" onSubmit={onSubmit}>
      <p className="text-xs text-slate-400">
        These settings apply across recommendations. Default persona: {defaultPersonaId || "none"}
      </p>
      <label className="text-sm block">
        Favorite grapes (comma separated)
        <input
          className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
          value={form.favorite_grapes}
          onChange={(e) => update("favorite_grapes", e.target.value)}
          placeholder="e.g. pinot noir, riesling"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          Quality tier
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.quality_tier}
            onChange={(e) => update("quality_tier", e.target.value)}
          >
            {qualityTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Risk tolerance
          <select
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.risk_tolerance}
            onChange={(e) => update("risk_tolerance", e.target.value)}
          >
            {riskToleranceLevels.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Budget min
          <input
            type="number"
            min="0"
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.usual_budget_min}
            onChange={(e) => update("usual_budget_min", e.target.value)}
          />
        </label>
        <label className="text-sm">
          Budget max
          <input
            type="number"
            min="0"
            className="w-full mt-1 rounded border border-slate-700 bg-slate-900 px-2 py-1"
            value={form.usual_budget_max}
            onChange={(e) => update("usual_budget_max", e.target.value)}
          />
        </label>
      </div>
      {preferences && (
        <p className="text-xs text-slate-500">Last updated: {new Date(preferences.updated_at).toLocaleString()}</p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-70"
      >
        {saving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
