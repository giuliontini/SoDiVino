export const wineColors = ["red", "white", "rose", "orange", "sparkling", "any"] as const;
export type WineColor = (typeof wineColors)[number];

export const bodyLevels = ["light", "medium", "full", "unknown"] as const;
export type BodyLevel = (typeof bodyLevels)[number];

export const intensityLevels = ["low", "medium", "high", "unknown"] as const;
export type IntensityLevel = (typeof intensityLevels)[number];

export const sweetnessLevels = ["dry", "off_dry", "sweet", "unknown"] as const;
export type SweetnessLevel = (typeof sweetnessLevels)[number];

export interface WinePersona {
  id: string;
  user_id: string;
  name: string;
  color: WineColor;
  grapes: string[];
  body: BodyLevel;
  tannin: IntensityLevel;
  acidity: IntensityLevel;
  sweetness: SweetnessLevel;
  food_pairing_tags: string[];
  min_price: number | null;
  max_price: number | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const qualityTiers = ["value", "everyday", "special"] as const;
export type QualityTier = (typeof qualityTiers)[number];

export const riskToleranceLevels = ["safe", "adventurous", "anything_goes"] as const;
export type RiskToleranceLevel = (typeof riskToleranceLevels)[number];

export interface UserPreferences {
  user_id: string;
  favorite_grapes: string[];
  quality_tier: QualityTier;
  usual_budget_min: number | null;
  usual_budget_max: number | null;
  risk_tolerance: RiskToleranceLevel;
  created_at: string;
  updated_at: string;
}

export type PersonaInput = Omit<WinePersona, "id" | "user_id" | "created_at" | "updated_at">;
export type UserPreferencesInput = Omit<UserPreferences, "user_id" | "created_at" | "updated_at">;
