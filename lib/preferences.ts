// lib/preferences.ts
// In-memory preferences; today from JSON-like const,
// later you can load from DB or Excel here.

export type WineProfile = {
  id: string;
  label: string;
  description: string;
  color: string;     // "red" | "white" | "sparkling" | "rosé" | "any"
  body: string;      // "light" | "medium" | "full" | "any"
  sweetness: string; // "dry" | "off-dry" | "sweet" | "any"
  acidity: string;   // "low" | "medium" | "high" | "any"
  budget: number;
};

const RAW_PROFILES: WineProfile[] = [
  {
    id: "crisp_whites",
    label: "Crisp Whites",
    description: "Light, dry whites with high acidity.",
    color: "white",
    body: "light",
    sweetness: "dry",
    acidity: "high",
    budget: 60,
  },
  {
    id: "bold_reds",
    label: "Bold Reds",
    description: "Full-bodied, structured reds.",
    color: "red",
    body: "full",
    sweetness: "off-dry",
    acidity: "medium",
    budget: 90,
  },
  {
    id: "easy_reds",
    label: "Easy Drinking Reds",
    description: "Medium-bodied, smooth reds with moderate tannins.",
    color: "red",
    body: "medium",
    sweetness: "dry",
    acidity: "medium",
    budget: 70,
  },
  {
    id: "bubbles",
    label: "Bubbles",
    description: "Dry sparkling wines for aperitivo or celebrations.",
    color: "sparkling",
    body: "light",
    sweetness: "dry",
    acidity: "medium",
    budget: 70,
  },
  {
    id: "sweet_aromatic",
    label: "Sweet & Aromatic",
    description: "Off-dry to sweet aromatic whites (e.g., Riesling, Moscato).",
    color: "white",
    body: "light",
    sweetness: "off-dry",
    acidity: "high",
    budget: 65,
  },
  {
    id: "value_under_40",
    label: "Best under 40",
    description: "Any style, focus on value under 40.",
    color: "any",
    body: "any",
    sweetness: "any",
    acidity: "any",
    budget: 40,
  },
];

export function getWineProfiles(): WineProfile[] {
  return RAW_PROFILES.map((p) => ({
    ...p,
    color: p.color.toLowerCase(),
    body: p.body.toLowerCase(),
    sweetness: p.sweetness.toLowerCase(),
    acidity: p.acidity.toLowerCase(),
  }));
}

export function getWineProfileById(id: string): WineProfile | undefined {
  return getWineProfiles().find((p) => p.id === id);
}

/*
// If you want Excel later, you can swap this implementation with something like:

import xlsx from "xlsx";
import path from "path";
import fs from "fs";

export function getWineProfiles(): WineProfile[] {
  const filePath = path.join(process.cwd(), "data", "preferences.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  return rows.map((row: any) => ({
    id: row.id,
    label: row.label,
    description: row.description,
    color: (row.color || "any").toLowerCase(),
    body: (row.body || "any").toLowerCase(),
    sweetness: (row.sweetness || "any").toLowerCase(),
    acidity: (row.acidity || "any").toLowerCase(),
    budget: Number(row.budget) || 50,
  }));
}
*/
