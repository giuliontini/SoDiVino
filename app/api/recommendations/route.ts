import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import type { WinePersona, UserPreferences } from "@/lib/cellarTypes";
import { rateWinesWithLLM } from "@/lib/recommendations";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  mapTasteProfileToPersona,
  mapTasteProfileToPreferences,
  type TasteProfile,
} from "@/lib/tasteProfiles";
import type { WineItem, WineRecommendation } from "@/lib/wineTypes";

const BATCH_SIZE = 10;
const PARSED_ITEMS_TABLE = "parsed_wine_items";
type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const runtime = "nodejs";
export const maxDuration = 60;

interface RecommendationsRequestBody {
  personaIds?: unknown;
  parsedListId?: unknown;
  listId?: unknown;
  wines?: unknown;
  tasteProfileId?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const rawBody = (await req.json()) as RecommendationsRequestBody | null;
    const parsed = parseRequestBody(rawBody);
    if ("error" in parsed) {
      return parsed.error;
    }

    const personaContext = await resolvePersonaContext(
      supabase,
      userId,
      parsed.personaIds,
      parsed.tasteProfileId,
    );

    if ("error" in personaContext) {
      return personaContext.error;
    }

    const { personas, preferences } = personaContext;

    if (personas.length === 0) {
      return NextResponse.json({ error: "No personas found for this user" }, { status: 404 });
    }

    const wines = parsed.parsedListId
      ? await loadWinesFromParsedList(supabase, userId, parsed.parsedListId)
      : normalizeWineArray(parsed.wines ?? []);

    if (!wines.length) {
      const message = parsed.parsedListId ? "No wines found for the provided list" : "Provide at least one wine";
      return NextResponse.json({ error: message }, { status: parsed.parsedListId ? 404 : 400 });
    }

    const knownIds = new Set(wines.map((wine) => wine.id));
    const aggregated: WineRecommendation[] = [];
    for (let i = 0; i < wines.length; i += BATCH_SIZE) {
      const batch = wines.slice(i, i + BATCH_SIZE);
      const recs = await rateWinesWithLLM(personas, preferences, batch);
      aggregated.push(...recs);
    }

    const deduped = dedupeRecommendations(aggregated, knownIds);
    deduped.sort((a, b) => b.score - a.score);

    return NextResponse.json({ recommendations: deduped });
  } catch (err) {
    console.error("recommendations POST error", err);
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function parseRequestBody(
  body: RecommendationsRequestBody | null,
):
  | { personaIds: string[]; parsedListId?: string; wines?: unknown[]; tasteProfileId?: string }
  | { error: NextResponse } {
  if (!body || typeof body !== "object") {
    return { error: NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 }) };
  }

  const personaIds = normalizeStringArray(body.personaIds).filter(Boolean);

  const tasteProfileId = typeof body.tasteProfileId === "string" ? body.tasteProfileId.trim() : undefined;
  if (!personaIds.length && !tasteProfileId) {
    return {
      error: NextResponse.json(
        { error: "Provide either personaIds or a tasteProfileId" },
        { status: 400 },
      ),
    };
  }

  const parsedListId =
    typeof body.parsedListId === "string"
      ? body.parsedListId.trim()
      : typeof body.listId === "string"
        ? body.listId.trim()
        : undefined;
  let wines: unknown[] | undefined;

  if (!parsedListId) {
    if (!Array.isArray(body.wines) || body.wines.length === 0) {
      return { error: NextResponse.json({ error: "Provide wines when parsedListId is not set" }, { status: 400 }) };
    }
    wines = body.wines;
  } else if (body.wines && !Array.isArray(body.wines)) {
    return { error: NextResponse.json({ error: "wines must be an array when provided" }, { status: 400 }) };
  } else if (Array.isArray(body.wines)) {
    wines = body.wines;
  }

  return { personaIds: Array.from(new Set(personaIds)), parsedListId, wines, tasteProfileId };
}

async function loadPersonas(
  supabase: SupabaseServerClient,
  userId: string,
  personaIds: string[],
): Promise<WinePersona[]> {
  if (!personaIds.length) {
    return [];
  }
  const { data, error } = await supabase
    .from("wine_personas")
    .select("*")
    .eq("user_id", userId)
    .in("id", personaIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function loadTasteProfile(
  supabase: SupabaseServerClient,
  userId: string,
  tasteProfileId: string,
): Promise<TasteProfile | null> {
  const { data, error } = await supabase
    .from("taste_profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("id", tasteProfileId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return (data as TasteProfile | null) ?? null;
}

async function resolvePersonaContext(
  supabase: SupabaseServerClient,
  userId: string,
  personaIds: string[],
  tasteProfileId?: string,
): Promise<{ personas: WinePersona[]; preferences: UserPreferences | null } | { error: NextResponse }> {
  if (personaIds.length > 0) {
    const [personas, preferences] = await Promise.all([
      loadPersonas(supabase, userId, personaIds),
      loadUserPreferences(supabase, userId),
    ]);
    return { personas, preferences };
  }

  if (tasteProfileId) {
    const tasteProfile = await loadTasteProfile(supabase, userId, tasteProfileId);
    if (!tasteProfile) {
      return { error: NextResponse.json({ error: "Taste profile not found" }, { status: 404 }) };
    }
    return {
      personas: [mapTasteProfileToPersona(tasteProfile)],
      preferences: mapTasteProfileToPreferences(tasteProfile),
    };
  }

  return {
    error: NextResponse.json({ error: "No persona or taste profile supplied" }, { status: 400 }),
  };
}

async function loadUserPreferences(supabase: SupabaseServerClient, userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data ?? null;
}

async function loadWinesFromParsedList(
  supabase: SupabaseServerClient,
  userId: string,
  parsedListId: string,
): Promise<WineItem[]> {
  const { data, error } = await supabase
    .from(PARSED_ITEMS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("parsed_list_id", parsedListId)
    .order("position", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? data : [];
  return rows
    .map((row) => normalizeWineRecord(row as Record<string, unknown>))
    .filter((wine): wine is WineItem => Boolean(wine));
}

function normalizeWineArray(values: unknown[]): WineItem[] {
  return values
    .map((value) => normalizeWineRecord(value as Record<string, unknown>))
    .filter((wine): wine is WineItem => Boolean(wine));
}

function normalizeWineRecord(record: Record<string, unknown>): WineItem | null {
  if (!record || typeof record !== "object") {
    return null;
  }

  const id = firstString(record, ["id", "wineId", "wine_id"]);
  const name = firstString(record, ["name", "wine_name"]);
  const rawText = firstString(record, ["rawText", "raw_text", "raw"]) || name;

  if (!id || !name || !rawText) {
    return null;
  }

  const wine: WineItem = { id, name, rawText };
  assignIfPresent(wine, "producer", firstString(record, ["producer", "producer_name"]));
  assignIfPresent(wine, "region", firstString(record, ["region"]));
  assignIfPresent(wine, "country", firstString(record, ["country"]));
  assignIfPresent(wine, "grape", firstString(record, ["grape", "varietal"]));
  assignIfPresent(wine, "vintage", firstString(record, ["vintage", "year"]));
  assignIfPresent(wine, "currency", firstString(record, ["currency"]));
  assignIfPresent(wine, "section", firstString(record, ["section", "list_section"]));

  const price = firstNumber(record, ["price", "price_value", "price_number"]);
  if (typeof price === "number") {
    wine.price = price;
  }

  const byGlass = coerceServing(record);
  if (byGlass) {
    wine.byGlassOrBottle = byGlass;
  }

  return wine;
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed) return trimmed;
    }
  }
  return undefined;
}

function firstNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const candidate = record[key];
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === "string") {
      const parsed = Number(candidate.replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function coerceServing(record: Record<string, unknown>): WineItem["byGlassOrBottle"] | undefined {
  const candidate = firstString(record, ["byGlassOrBottle", "by_glass_or_bottle", "serving_type"]);
  if (!candidate) {
    return undefined;
  }

  const normalized = candidate.toLowerCase();
  if (normalized.includes("glass") && normalized.includes("bottle")) return "both";
  if (normalized.includes("glass")) return "glass";
  if (normalized.includes("bottle")) return "bottle";
  if (["both", "unknown"].includes(normalized)) {
    return normalized as WineItem["byGlassOrBottle"];
  }
  return undefined;
}

function assignIfPresent<T extends object, K extends keyof T>(target: T, key: K, value: T[K] | undefined) {
  if (value !== undefined && value !== null) {
    target[key] = value as T[K];
  }
}

function dedupeRecommendations(recs: WineRecommendation[], validIds: Set<string>): WineRecommendation[] {
  const byId = new Map<string, WineRecommendation>();

  for (const rec of recs) {
    if (!validIds.has(rec.wineId)) continue;
    const normalized: WineRecommendation = {
      wineId: rec.wineId,
      score: clampScore(rec.score),
      reason: rec.reason.trim(),
      tags: Array.from(new Set(rec.tags.map((tag) => tag.trim()).filter(Boolean))),
    };

    const existing = byId.get(rec.wineId);
    if (!existing || normalized.score > existing.score) {
      byId.set(rec.wineId, normalized);
    }
  }

  return Array.from(byId.values());
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}
