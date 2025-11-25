// lib/wine-agent.ts
import type { WineProfile } from "./preferences";

export type ParsedWine = {
  name: string;
  color: string;
  body: string;
  sweetness: string;
  acidity: string;
  price: number | null;
  notes?: string;
};

export type ScoredWine = {
  wine: ParsedWine;
  score: number;
  reasons: string[];
};

export function parseWinesFromText(text: string): ParsedWine[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const wines: ParsedWine[] = [];
  const priceRegex = /(\d{2,3}(?:\.\d{1,2})?)\s*$/;

  for (const line of lines) {
    const match = line.match(priceRegex);
    if (!match) continue;

    const price = parseFloat(match[1]);
    const namePart = line.replace(priceRegex, "").trim();
    const lower = namePart.toLowerCase();

    let color = "unknown";
    if (lower.includes("rosé") || lower.includes("rose")) color = "rosé";
    else if (
      lower.includes("sparkling") ||
      lower.includes("prosecco") ||
      lower.includes("champagne") ||
      lower.includes("cava")
    )
      color = "sparkling";
    else if (lower.includes("white") || lower.includes("bianco") || lower.includes("blanc"))
      color = "white";
    else if (lower.includes("red") || lower.includes("rosso") || lower.includes("rouge"))
      color = "red";

    const body = lower.includes("full")
      ? "full"
      : lower.includes("light")
      ? "light"
      : "medium";

    const sweetness = lower.includes("sweet") || lower.includes("dolce")
      ? "sweet"
      : lower.includes("off-dry") || lower.includes("demi-sec")
      ? "off-dry"
      : "dry";

    const acidity =
      lower.includes("crisp") || lower.includes("fresh") || lower.includes("high acidity")
        ? "high"
        : "medium";

    wines.push({
      name: namePart,
      color,
      body,
      sweetness,
      acidity,
      price: isNaN(price) ? null : price,
      notes: "",
    });
  }

  return wines;
}

export function scoreWine(
  wine: ParsedWine,
  prefs: WineProfile,
  options: { budget?: number; dislikes?: string[]; adventurous?: number } = {}
): ScoredWine {
  let score = 0;
  const reasons: string[] = [];

  const budget = options.budget ?? prefs.budget;
  const dislikes = (options.dislikes || []).map((w) => w.toLowerCase());
  const adventurous = Math.max(0, Math.min(10, options.adventurous ?? 3));

  // Color
  if (prefs.color !== "any") {
    if (wine.color === prefs.color) {
      score += 3;
      reasons.push("matches your preferred color");
    } else {
      score -= 1;
      reasons.push("different color than your usual choice");
    }
  }

  // Body
  if (prefs.body !== "any") {
    if (wine.body === prefs.body) {
      score += 2;
      reasons.push("body matches your preference");
    } else if (
      (prefs.body === "medium" && (wine.body === "light" || wine.body === "full")) ||
      (prefs.body !== "medium" && wine.body === "medium")
    ) {
      score += 1;
      reasons.push("body is close to your preference");
    } else {
      score -= 0.5;
    }
  }

  // Sweetness
  if (prefs.sweetness !== "any") {
    if (wine.sweetness === prefs.sweetness) {
      score += 2;
      reasons.push("sweetness matches your preference");
    } else if (prefs.sweetness === "off-dry" && (wine.sweetness === "dry" || wine.sweetness === "sweet")) {
      score += 0.5;
      reasons.push("sweetness is near your sweet spot");
    } else {
      score -= 1;
    }
  }

  // Acidity
  if (prefs.acidity !== "any") {
    if (wine.acidity === prefs.acidity) {
      score += 1.5;
      reasons.push("acidity is in your comfort zone");
    } else {
      score -= 0.5;
    }
  }

  // Budget
  if (wine.price != null) {
    if (wine.price <= budget) {
      score += 2;
      reasons.push(`within your budget (${wine.price} ≤ ${budget})`);
    } else {
      const overBy = wine.price - budget;
      score -= overBy / 15;
      reasons.push(`above your budget by ~${Math.round(overBy)}`);
    }
  }

  const haystack = (wine.name + " " + (wine.notes || "")).toLowerCase();
  for (const word of dislikes) {
    if (word && haystack.includes(word)) {
      score -= 3;
      reasons.push(`contains “${word}”, which you wanted to avoid`);
    }
  }

  if (adventurous >= 7) {
    if (prefs.color !== "any" && wine.color !== prefs.color && wine.price && wine.price <= budget * 1.3) {
      score += 2;
      reasons.push("fun alternative to your usual style (you said you’re adventurous)");
    }
  }

  return { wine, score, reasons };
}
