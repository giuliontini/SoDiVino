import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { WineItem } from "@/lib/wineTypes";

const PARSED_ITEMS_TABLE = "parsed_wine_items";

export async function GET(req: NextRequest) {
  try {
    const parsedListId = req.nextUrl.searchParams.get("parsedListId");
    if (!parsedListId) {
      return NextResponse.json({ error: "parsedListId is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();

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
    const wines = rows
      .map((row) => normalizeWineRecord(row as Record<string, unknown>))
      .filter((wine): wine is WineItem => Boolean(wine));

    return NextResponse.json({ wines });
  } catch (err) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.error("parsed-wines GET", err);
    return NextResponse.json({ error: "Failed to load parsed wines" }, { status: 500 });
  }
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

  return wine;
}

function firstString(value: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

function firstNumber(value: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function assignIfPresent<T extends Record<string, unknown>, K extends keyof T>(target: T, key: K, value: T[K] | null) {
  if (value !== null && value !== undefined) {
    target[key] = value;
  }
}
