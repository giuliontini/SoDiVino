import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const userId = /* TODO: get from auth */;
  const { data, error } = await supabaseServer
    .from("wine_personas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ personas: data });
}

export async function POST(req: NextRequest) {
  const userId = /* TODO: get from auth */;
  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("wine_personas")
    .insert([{ ...body, user_id: userId }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ persona: data });
}
