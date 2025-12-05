import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeMenuSessionInput, type MenuSession, type MenuSessionInput } from "@/lib/menuSessions";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const id = req.nextUrl.searchParams.get("id");

    const query = supabase
      .from("menu_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const { data, error } = id ? await query.eq("id", id).maybeSingle() : await query.maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ session: (data as MenuSession | null) ?? null });
  } catch (err) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.error("menu-sessions GET", err);
    return NextResponse.json({ error: "Failed to load menu session" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const userId = await getUserId();
    const body = (await req.json()) as MenuSessionInput | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
    }

    const normalized = normalizeMenuSessionInput(body);
    const payload = {
      user_id: userId,
      restaurant_name: normalized.restaurant_name,
      parsed_list_id: normalized.parsed_list_id,
      upload_reference: normalized.upload_reference,
      status: normalized.status,
    } satisfies Partial<MenuSession> & { user_id: string };

    const { data, error } = await supabase
      .from("menu_sessions")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ session: data as MenuSession });
  } catch (err) {
    if ((err as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.error("menu-sessions POST", err);
    return NextResponse.json({ error: "Failed to create menu session" }, { status: 500 });
  }
}
