import { NextResponse } from "next/server";
import {
  PersonaInput,
  UserPreferencesInput,
  bodyLevels,
  intensityLevels,
  qualityTiers,
  riskToleranceLevels,
  sweetnessLevels,
  wineColors
} from "./cellarTypes";

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string").map((v) => v.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function validatePersonaInput(body: Record<string, unknown>): { data?: PersonaInput; error?: NextResponse } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return { error: NextResponse.json({ error: "Name is required" }, { status: 400 }) };
  }

  const color = typeof body.color === "string" && (wineColors as readonly string[]).includes(body.color)
    ? (body.color as PersonaInput["color"])
    : null;
  if (!color) {
    return { error: NextResponse.json({ error: "Invalid color" }, { status: 400 }) };
  }

  const bodyLevel =
    typeof body.body === "string" && (bodyLevels as readonly string[]).includes(body.body)
      ? (body.body as PersonaInput["body"])
      : "unknown";
  const tanninLevel =
    typeof body.tannin === "string" && (intensityLevels as readonly string[]).includes(body.tannin)
      ? (body.tannin as PersonaInput["tannin"])
      : "unknown";
  const acidityLevel =
    typeof body.acidity === "string" && (intensityLevels as readonly string[]).includes(body.acidity)
      ? (body.acidity as PersonaInput["acidity"])
      : "unknown";
  const sweetnessLevel =
    typeof body.sweetness === "string" && (sweetnessLevels as readonly string[]).includes(body.sweetness)
      ? (body.sweetness as PersonaInput["sweetness"])
      : "unknown";

  const grapes = parseStringArray(body.grapes);
  const foodTags = parseStringArray(body.food_pairing_tags);
  const minPrice = parseNullableNumber(body.min_price);
  const maxPrice = parseNullableNumber(body.max_price);
  const notes = typeof body.notes === "string" ? body.notes.trim() : null;
  const isDefault = body.is_default === true || body.is_default === "true";

  return {
    data: {
      name,
      color,
      grapes,
      body: bodyLevel,
      tannin: tanninLevel,
      acidity: acidityLevel,
      sweetness: sweetnessLevel,
      food_pairing_tags: foodTags,
      min_price: minPrice,
      max_price: maxPrice,
      notes,
      is_default: isDefault
    }
  };
}

export function validateUserPreferencesInput(
  body: Record<string, unknown>
): { data?: UserPreferencesInput; error?: NextResponse } {
  const favorite_grapes = parseStringArray(body.favorite_grapes);

  const quality_tier =
    typeof body.quality_tier === "string" && (qualityTiers as readonly string[]).includes(body.quality_tier)
      ? (body.quality_tier as UserPreferencesInput["quality_tier"])
      : "value";

  const usual_budget_min = parseNullableNumber(body.usual_budget_min);
  const usual_budget_max = parseNullableNumber(body.usual_budget_max);

  const risk_tolerance =
    typeof body.risk_tolerance === "string" && (riskToleranceLevels as readonly string[]).includes(body.risk_tolerance)
      ? (body.risk_tolerance as UserPreferencesInput["risk_tolerance"])
      : "safe";

  return {
    data: {
      favorite_grapes,
      quality_tier,
      usual_budget_min,
      usual_budget_max,
      risk_tolerance
    }
  };
}
