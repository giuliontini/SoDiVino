import OpenAI from "openai";
import type { WinePersona, UserPreferences } from "./cellarTypes";
import type { WineItem, WineRecommendation } from "./wineTypes";

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MODEL = process.env.RECOMMENDER_MODEL || "gpt-4.1-mini";

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["wineId", "score", "reason", "tags"],
        properties: {
          wineId: { type: "string" },
          score: { type: "number" },
          reason: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
  required: ["recommendations"],
} as const;

const SYSTEM_PROMPT = `You are a master sommelier helping a host recommend wines to a guest.
For each batch of wines you must rate how well every wine fits the provided personas and global preferences.
Always return JSON with the shape { "recommendations": WineRecommendation[] } where each recommendation matches: { "wineId": string, "score": number (0-100), "reason": string, "tags": string[] }.
Reasons should be short (<240 chars) and tags must highlight key attributes such as "safe", "bold", "good value", "food pairing", etc.
Score each wine relative to this group; do not omit wines unless information is missing.`;

export async function rateWinesWithLLM(
  personas: WinePersona[],
  prefs: UserPreferences | null,
  winesBatch: WineItem[],
): Promise<WineRecommendation[]> {
  if (winesBatch.length === 0) {
    return [];
  }

  if (!openaiClient) {
    return heuristicRate(personas, prefs, winesBatch);
  }

  try {
    const userPrompt = buildUserPrompt(personas, prefs, winesBatch);
    const response = await openaiClient.responses.create({
      model: MODEL,
      text: {
        format: {
          type: "json_schema",
          name: "wine_recommendations",
          schema: RESPONSE_SCHEMA,
          strict: true,
        },
      },
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SYSTEM_PROMPT }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
    });

    const output = response.output_text;
    if (!output) {
      throw new Error("Missing language model response");
    }

    const parsed = safeParseRecommendations(JSON.parse(output));
    if (parsed.length > 0) {
      return parsed;
    }

    return heuristicRate(personas, prefs, winesBatch);
  } catch (err) {
    console.error("rateWinesWithLLM error", err);
    return heuristicRate(personas, prefs, winesBatch);
  }
}

function buildUserPrompt(personas: WinePersona[], prefs: UserPreferences | null, wines: WineItem[]): string {
  const personaSummary =
    personas.length > 0 ? personas.map((persona) => summarizePersona(persona)).join("\n") : "No personas supplied.";
  const preferenceSummary = summarizePreferences(prefs);
  const winesJson = JSON.stringify(wines, null, 2);

  return [
    "Consider the following tasting personas and user preferences.",
    "",
    "Personas:",
    personaSummary,
    "",
    "Global Preferences:",
    preferenceSummary,
    "",
    "Wines to evaluate (each wine has an id you must echo in the response):",
    winesJson,
    "",
    'Return a JSON object { "recommendations": Recommendation[] } sorted by score (highest first). Each recommendation must include wineId, score (0-100),',
    "a concise reason, and 1-4 descriptive tags. Ensure every wine in the batch appears once.",
  ].join("\n");
}

function summarizePersona(persona: WinePersona): string {
  const grapePart = persona.grapes.length ? `Grapes: ${persona.grapes.join(", ")}.` : "Grapes: flexible.";
  const foodPart = persona.food_pairing_tags.length ? `Food tags: ${persona.food_pairing_tags.join(", ")}.` : "";
  const priceBounds =
    persona.min_price || persona.max_price
      ? `Price target: ${persona.min_price ?? "?"} - ${persona.max_price ?? "?"}.`
      : "Price target: flexible.";
  const notes = persona.notes ? `Notes: ${persona.notes}` : "";

  return `- ${persona.name}: prefers ${persona.color} wines (${persona.body} body, ${persona.tannin} tannin, ${persona.acidity} acidity, ${persona.sweetness} sweetness). ${grapePart} ${foodPart} ${priceBounds} ${notes}`.trim();
}

function summarizePreferences(prefs: UserPreferences | null): string {
  if (!prefs) {
    return "No stored user preferences. Default to balanced recommendations.";
  }

  const grapes = prefs.favorite_grapes.length ? `Favorites: ${prefs.favorite_grapes.join(", ")}.` : "Favorites: open.";
  const budget =
    prefs.usual_budget_min || prefs.usual_budget_max
      ? `Usual budget: ${prefs.usual_budget_min ?? "?"} - ${prefs.usual_budget_max ?? "?"}.`
      : "Usual budget: flexible.";

  return `${grapes} Quality tier: ${prefs.quality_tier}. Risk tolerance: ${prefs.risk_tolerance}. ${budget}`;
}

function safeParseRecommendations(payload: unknown): WineRecommendation[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as { recommendations?: unknown }).recommendations)
  ) {
    return [];
  }

  const value = (payload as { recommendations: unknown[] }).recommendations;
  const recs: WineRecommendation[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const wineId = typeof obj.wineId === "string" && obj.wineId.trim().length > 0 ? obj.wineId.trim() : null;
    const reason = typeof obj.reason === "string" && obj.reason.trim().length > 0 ? obj.reason.trim() : null;
    const score = typeof obj.score === "number" && Number.isFinite(obj.score) ? clampScore(obj.score) : null;
    const tags =
      Array.isArray(obj.tags) && obj.tags.every((tag) => typeof tag === "string")
        ? uniqueStrings(obj.tags as string[])
        : [];

    if (wineId && reason && score !== null) {
      recs.push({ wineId, reason, score, tags });
    }
  }

  return recs;
}

function heuristicRate(
  personas: WinePersona[],
  prefs: UserPreferences | null,
  wines: WineItem[],
): WineRecommendation[] {
  return wines.map((wine, index) => {
    let score = 40 + index; // simple differentiator to keep ordering deterministic
    const tags = new Set<string>();
    const reasons: string[] = [];

    if (wine.price != null) {
      const personaMatch = personas
        .map((persona) => scorePriceAgainstPersona(wine.price!, persona))
        .sort((a, b) => b.delta - a.delta)[0];
      if (personaMatch && personaMatch.delta > 0) {
        score += personaMatch.delta;
        tags.add("price match");
        reasons.push(personaMatch.reason);
      }

      if (prefs) {
        const withinBudget =
          (prefs.usual_budget_min == null || wine.price >= prefs.usual_budget_min) &&
          (prefs.usual_budget_max == null || wine.price <= prefs.usual_budget_max);
        if (withinBudget) {
          score += 5;
          tags.add("good value");
          reasons.push("within typical budget");
        }
      }
    }

    if (wine.grape) {
      const grape = wine.grape.toLowerCase();
      const matchedPersona = personas.find((persona) =>
        persona.grapes.some((g) => g.toLowerCase() === grape),
      );
      if (matchedPersona) {
        score += 8;
        tags.add("grape match");
        reasons.push(`aligns with ${matchedPersona.name}'s grape preferences`);
      }

      if (prefs?.favorite_grapes.some((g) => g.toLowerCase() === grape)) {
        score += 6;
        tags.add("familiar");
        reasons.push("uses a favorite grape");
      }
    }

    if (prefs) {
      if (prefs.risk_tolerance === "safe") {
        tags.add("safe");
      } else if (prefs.risk_tolerance === "adventurous") {
        tags.add("adventurous");
        score += 2;
      } else {
        tags.add("anything goes");
        score += 3;
      }
    }

    const reasonText = reasons.length > 0 ? reasons.join("; ") : "Balanced pick based on limited data.";
    return {
      wineId: wine.id,
      score: clampScore(score),
      reason: reasonText,
      tags: Array.from(tags),
    };
  });
}

function scorePriceAgainstPersona(price: number, persona: WinePersona): { delta: number; reason: string } {
  if (persona.min_price == null && persona.max_price == null) {
    return { delta: 0, reason: "" };
  }

  const min = persona.min_price ?? persona.max_price ?? price;
  const max = persona.max_price ?? persona.min_price ?? price;

  if (price >= min && price <= max) {
    return { delta: 10, reason: `hits ${persona.name}'s target price` };
  }

  const closestBound = price < min ? min : max;
  const diff = Math.abs(price - closestBound);
  const penalty = Math.min(6, diff / 5);
  return {
    delta: -penalty,
    reason: `price is ${price < min ? "below" : "above"} ${persona.name}'s target`,
  };
}

function clampScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function uniqueStrings(values: string[]): string[] {
  const set = new Set<string>();
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed) {
      set.add(trimmed);
    }
  }
  return Array.from(set);
}
