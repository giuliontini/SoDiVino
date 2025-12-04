import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { validateUserPreferencesInput } from "@/lib/validators";

const defaultPreferences = {
  favorite_grapes: [],
  quality_tier: "value",
  usual_budget_min: null,
  usual_budget_max: null,
  risk_tolerance: "safe"
} as const;

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data) return NextResponse.json({ preferences: data });

    const { data: inserted, error: insertError } = await supabase
      .from("user_preferences")
      .insert([{ ...defaultPreferences, user_id: userId }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: inserted });
  } catch (err: unknown) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const body = await req.json();
    const { data: payload, error } = validateUserPreferencesInput(body);
    if (error) return error;

    const { data, error: upsertError } = await supabase
      .from("user_preferences")
      .upsert({ user_id: userId, ...payload })
      .select()
      .single();

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (err: unknown) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
