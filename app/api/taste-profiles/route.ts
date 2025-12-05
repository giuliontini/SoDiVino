import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeTasteProfileInput, type TasteProfile, type TasteProfileInput } from "@/lib/tasteProfiles";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();

    const { data, error } = await supabase
      .from("taste_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ profile: (data as TasteProfile | null) ?? null });
  } catch (err) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.error("taste-profiles GET", err);
    return NextResponse.json({ error: "Failed to load taste profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const body = (await req.json()) as TasteProfileInput | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
    }

    const normalized = normalizeTasteProfileInput(body);
    const insertPayload = {
      user_id: userId,
      profile_name: normalized.profile_name,
      preferred_styles: normalized.preferred_styles,
      sweetness_preference: normalized.sweetness_preference,
      adventurousness: normalized.adventurousness,
      budget_focus: normalized.budget_focus,
      occasion_tags: normalized.occasion_tags,
      favorite_regions: normalized.favorite_regions,
      notes: normalized.notes,
    } satisfies Partial<TasteProfile> & { user_id: string };

    const { data, error } = await supabase
      .from("taste_profiles")
      .insert(insertPayload)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ profile: data as TasteProfile });
  } catch (err) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.error("taste-profiles POST", err);
    return NextResponse.json({ error: "Failed to save taste profile" }, { status: 500 });
  }
}
