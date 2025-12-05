import type { UserPreferences, WinePersona } from "./cellarTypes";

export const sweetnessPreferences = ["dry", "off_dry", "sweet", "flexible"] as const;
export type SweetnessPreference = (typeof sweetnessPreferences)[number];

export const adventurousnessLevels = ["classic", "balanced", "bold"] as const;
export type AdventurousnessLevel = (typeof adventurousnessLevels)[number];

export const budgetFocusLevels = ["value", "balanced", "premium"] as const;
export type BudgetFocusLevel = (typeof budgetFocusLevels)[number];

export interface TasteProfile {
  id: string;
  user_id: string;
  profile_name: string;
  preferred_styles: string[];
  sweetness_preference: SweetnessPreference;
  adventurousness: AdventurousnessLevel;
  budget_focus: BudgetFocusLevel;
  occasion_tags: string[];
  favorite_regions: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TasteProfileInput = {
  profile_name?: string;
  preferred_styles?: string[];
  sweetness_preference?: SweetnessPreference;
  adventurousness?: AdventurousnessLevel;
  budget_focus?: BudgetFocusLevel;
  occasion_tags?: string[];
  favorite_regions?: string[];
  notes?: string | null;
};

const DEFAULT_PROFILE_NAME = "Primary profile";

export function normalizeTasteProfileInput(input: TasteProfileInput): Required<TasteProfileInput> {
  return {
    profile_name: input.profile_name?.trim() || DEFAULT_PROFILE_NAME,
    preferred_styles: Array.isArray(input.preferred_styles) ? dedupeStrings(input.preferred_styles) : [],
    sweetness_preference: input.sweetness_preference ?? "dry",
    adventurousness: input.adventurousness ?? "balanced",
    budget_focus: input.budget_focus ?? "balanced",
    occasion_tags: Array.isArray(input.occasion_tags) ? dedupeStrings(input.occasion_tags) : [],
    favorite_regions: Array.isArray(input.favorite_regions) ? dedupeStrings(input.favorite_regions) : [],
    notes: typeof input.notes === "string" ? input.notes : null,
  };
}

export function mapTasteProfileToPersona(profile: TasteProfile): WinePersona {
  const style = profile.preferred_styles[0]?.toLowerCase() || "any";
  const color = mapStyleToColor(style);
  const sweetness = mapSweetness(profile.sweetness_preference);
  const body = mapBody(style);

  const nowIso = new Date().toISOString();
  return {
    id: `taste-profile-${profile.id}`,
    user_id: profile.user_id,
    name: profile.profile_name,
    color,
    grapes: [],
    body,
    tannin: "unknown",
    acidity: "unknown",
    sweetness,
    food_pairing_tags: profile.occasion_tags,
    min_price: profile.budget_focus === "value" ? 0 : null,
    max_price: null,
    notes: profile.notes,
    is_default: true,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export function mapTasteProfileToPreferences(profile: TasteProfile): UserPreferences {
  const nowIso = new Date().toISOString();
  return {
    user_id: profile.user_id,
    favorite_grapes: [],
    quality_tier: profile.budget_focus === "premium" ? "special" : profile.budget_focus === "value" ? "value" : "everyday",
    usual_budget_min: profile.budget_focus === "value" ? 0 : null,
    usual_budget_max: null,
    risk_tolerance:
      profile.adventurousness === "bold"
        ? "anything_goes"
        : profile.adventurousness === "classic"
          ? "safe"
          : "adventurous",
    created_at: nowIso,
    updated_at: nowIso,
  };
}

function mapStyleToColor(style: string): WinePersona["color"] {
  if (style.includes("red")) return "red";
  if (style.includes("white")) return "white";
  if (style.includes("sparkling") || style.includes("bubbles")) return "sparkling";
  if (style.includes("rose")) return "rose";
  return "any";
}

function mapSweetness(value: SweetnessPreference): WinePersona["sweetness"] {
  switch (value) {
    case "off_dry":
      return "off_dry";
    case "sweet":
      return "sweet";
    case "flexible":
      return "unknown";
    default:
      return "dry";
  }
}

function mapBody(style: string): WinePersona["body"] {
  if (style.includes("sparkling") || style.includes("white")) return "light";
  if (style.includes("red")) return "medium";
  return "unknown";
}

function dedupeStrings(values: string[]): string[] {
  const set = new Set<string>();
  values
    .map((value) => value?.toString()?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0))
    .forEach((value) => set.add(value));
  return Array.from(set);
}
