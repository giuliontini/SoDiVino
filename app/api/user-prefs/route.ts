import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateUserPreferencesInput } from "@/lib/validators";

const defaultPreferences = {
  favorite_grapes: [],
  quality_tier: "value",
  usual_budget_min: null,
  usual_budget_max: null,
  risk_tolerance: "safe"
} as const;

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServer
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (data) return NextResponse.json({ preferences: data });

    const { data: inserted, error: insertError } = await supabaseServer
      .from("user_preferences")
      .insert([{ ...defaultPreferences, user_id: userId }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ preferences: inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    if (message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const body = await req.json();
    const { data: payload, error } = validateUserPreferencesInput(body);
    if (error) return error;

    const { data, error: upsertError } = await supabaseServer
      .from("user_preferences")
      .upsert({ user_id: userId, ...payload })
      .select()
      .single();

    if (upsertError) throw upsertError;

    return NextResponse.json({ preferences: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    if (message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
