export interface WineItem {
  id: string;
  name: string;
  producer?: string;
  region?: string;
  country?: string;
  grape?: string;
  vintage?: string;
  price?: number;
  currency?: string;
  byGlassOrBottle?: "glass" | "bottle" | "both" | "unknown";
  section?: string;
  rawText: string;
}

export interface WineRecommendation {
  wineId: string;
  score: number;
  reason: string;
  tags: string[];
}
