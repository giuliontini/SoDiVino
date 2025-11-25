import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const userId = /* TODO: auth */;
  const { data, error } = await supabaseServer
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ preferences: data });
}

export async function PUT(req: NextRequest) {
  const userId = /* TODO: auth */;
  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("user_preferences")
    .upsert({ user_id: userId, ...body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ preferences: data });
}
