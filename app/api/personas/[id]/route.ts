import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";
import { validatePersonaInput } from "@/lib/validators";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = requireUserId(req);
    const body = await req.json();
    const { data: payload, error } = validatePersonaInput(body);
    if (error) return error;

    if (payload?.is_default) {
      await supabaseServer.from("wine_personas").update({ is_default: false }).eq("user_id", userId);
    }

    const { data, error: updateError } = await supabaseServer
      .from("wine_personas")
      .update(payload)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ persona: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    if (message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = requireUserId(req);
    const { error } = await supabaseServer.from("wine_personas").delete().eq("id", params.id).eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    if (message.startsWith("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
