"use client";

import { useMemo, useState } from "react";
import type React from "react";
import type { TasteProfileInput } from "@/lib/tasteProfiles";
import { ArrowRightIcon, SparklesIcon, WineIcon } from "./icons";

export interface TasteProfileFormValues extends Required<TasteProfileInput> {}

interface TasteProfileFormProps {
  initialValues?: Partial<TasteProfileFormValues>;
  onSubmit: (values: TasteProfileFormValues) => Promise<void> | void;
  isSaving?: boolean;
  error?: string | null;
}

const styleOptions = [
  { key: "red", label: "Red focused" },
  { key: "white", label: "White & crisp" },
  { key: "sparkling", label: "Sparkling / celebratory" },
  { key: "varied", label: "Open to anything" },
];

const sweetnessOptions = [
  { key: "dry", label: "Dry" },
  { key: "off_dry", label: "Off-dry" },
  { key: "sweet", label: "Sweeter" },
  { key: "flexible", label: "Surprise me" },
];

const adventurousnessOptions = [
  { key: "classic", label: "Classic & safe" },
  { key: "balanced", label: "Balanced" },
  { key: "bold", label: "Bold & curious" },
];

const budgetOptions = [
  { key: "value", label: "Value driven" },
  { key: "balanced", label: "Balanced" },
  { key: "premium", label: "Premium picks" },
];

export function TasteProfileForm({ initialValues, onSubmit, isSaving, error }: TasteProfileFormProps) {
  const defaults: TasteProfileFormValues = useMemo(
    () => ({
      profile_name: initialValues?.profile_name || "Primary profile",
      preferred_styles: initialValues?.preferred_styles ?? [],
      sweetness_preference: initialValues?.sweetness_preference || "dry",
      adventurousness: initialValues?.adventurousness || "balanced",
      budget_focus: initialValues?.budget_focus || "balanced",
      occasion_tags: initialValues?.occasion_tags ?? [],
      favorite_regions: initialValues?.favorite_regions ?? [],
      notes: initialValues?.notes ?? null,
    }),
    [initialValues],
  );

  const [values, setValues] = useState<TasteProfileFormValues>(defaults);

  const toggleStyle = (styleKey: string) => {
    setValues((prev) => {
      const nextStyles = prev.preferred_styles.includes(styleKey)
        ? prev.preferred_styles.filter((s) => s !== styleKey)
        : [...prev.preferred_styles, styleKey];
      return { ...prev, preferred_styles: nextStyles };
    });
  };

  const toggleOccasion = (tag: string) => {
    setValues((prev) => {
      const nextTags = prev.occasion_tags.includes(tag)
        ? prev.occasion_tags.filter((s) => s !== tag)
        : [...prev.occasion_tags, tag];
      return { ...prev, occasion_tags: nextTags };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-white/60"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#8b4049]">
          <WineIcon className="h-6 w-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Taste profile</p>
        </div>
        <span className="flex items-center gap-2 text-sm text-[#5b5b5b]">
          <SparklesIcon className="h-4 w-4" />
          Simplified onboarding replaces the legacy persona sliders.
        </span>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2c2c2c]">Preferred styles</h2>
          <p className="text-sm text-[#6b6b6b]">Pick one or more to steer color and body.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {styleOptions.map((option) => {
            const active = values.preferred_styles.includes(option.key);
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleStyle(option.key)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-[#8b4049] bg-[#8b4049]/10 text-[#2c2c2c]"
                    : "border-[#e6dcd4] bg-white/70 text-[#4a4a4a] hover:border-[#8b4049]/40"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                {active ? <span className="text-sm text-[#8b4049]">Selected</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <FieldGroup
          title="Sweetness"
          description="Keep it dry, or allow some richness."
          options={sweetnessOptions}
          value={values.sweetness_preference}
          onChange={(val) => setValues((prev) => ({ ...prev, sweetness_preference: val as TasteProfileFormValues["sweetness_preference"] }))}
        />
        <FieldGroup
          title="Adventurousness"
          description="Guide how daring to be on the list."
          options={adventurousnessOptions}
          value={values.adventurousness}
          onChange={(val) => setValues((prev) => ({ ...prev, adventurousness: val as TasteProfileFormValues["adventurousness"] }))}
        />
        <FieldGroup
          title="Budget focus"
          description="Signal value, balance, or premium picks."
          options={budgetOptions}
          value={values.budget_focus}
          onChange={(val) => setValues((prev) => ({ ...prev, budget_focus: val as TasteProfileFormValues["budget_focus"] }))}
        />
        <div className="rounded-2xl border border-[#e6dcd4] bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#2c2c2c]">Occasion tags</h3>
            <p className="text-xs text-[#6b6b6b]">Helps us theme recommendations.</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Date night", "Celebration", "Business", "Casual"].map((tag) => {
              const active = values.occasion_tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleOccasion(tag)}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    active ? "bg-[#8b4049] text-white" : "bg-[#f2e8e2] text-[#4a4a4a] hover:bg-[#e7d5cc]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e6dcd4] bg-white/70 p-4">
          <h3 className="text-base font-semibold text-[#2c2c2c]">Favorite regions (optional)</h3>
          <p className="text-sm text-[#6b6b6b]">Comma-separated</p>
          <input
            type="text"
            className="mt-2 w-full rounded-lg border border-[#d9c8bf] bg-white px-3 py-2 text-sm text-[#2c2c2c] focus:border-[#8b4049] focus:outline-none"
            placeholder="e.g. Napa, Burgundy, Piedmont"
            value={values.favorite_regions.join(", ")}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, favorite_regions: event.target.value.split(",").map((v) => v.trim()).filter(Boolean) }))
            }
          />
        </div>
        <div className="rounded-2xl border border-[#e6dcd4] bg-white/70 p-4">
          <h3 className="text-base font-semibold text-[#2c2c2c]">Notes for our sommelier</h3>
          <textarea
            className="mt-2 w-full rounded-lg border border-[#d9c8bf] bg-white px-3 py-2 text-sm text-[#2c2c2c] focus:border-[#8b4049] focus:outline-none"
            rows={4}
            placeholder="Anything else you want us to remember?"
            value={values.notes ?? ""}
            onChange={(event) => setValues((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#5b5b5b]">Saved taste profiles feed the new recommendation flow.</p>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-6 py-2 text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Continue to menu"}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

interface FieldGroupProps {
  title: string;
  description: string;
  value: string;
  options: { key: string; label: string }[];
  onChange: (value: string) => void;
}

function FieldGroup({ title, description, value, options, onChange }: FieldGroupProps) {
  return (
    <div className="rounded-2xl border border-[#e6dcd4] bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#2c2c2c]">{title}</h3>
        <p className="text-xs text-[#6b6b6b]">{description}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              value === option.key
                ? "bg-[#8b4049] text-white"
                : "bg-[#f2e8e2] text-[#4a4a4a] hover:bg-[#e7d5cc]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
