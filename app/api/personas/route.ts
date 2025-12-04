import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { validatePersonaInput } from "@/lib/validators";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const { data, error } = await supabase
      .from("wine_personas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ personas: data ?? [] });
  } catch (err: unknown) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const body = await req.json();

    const { data: payload, error } = validatePersonaInput(body);
    if (error) return error;

    if (payload?.is_default) {
      await supabase.from("wine_personas").update({ is_default: false }).eq("user_id", userId);
    }

    const { data, error: insertError } = await supabase
      .from("wine_personas")
      .insert([{ ...payload, user_id: userId }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ persona: data });
  } catch (err: unknown) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
