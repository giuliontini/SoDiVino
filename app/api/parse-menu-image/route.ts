import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireUserId } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabaseServer";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const restaurantName = formData.get("restaurantName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }


  // Call OpenAI vision (pseudo-code, depends on client version)
    const result = await openai.responses.create({
      model: "gpt-4.1-mini", // or vision-capable model
      input: [
        {
          role: "system",
          content:
            "You are a sommelier assistant. Extract a structured list of wines from this restaurant menu image. Return JSON only."
        },
        /* TODO: fix the error input below */
        {
          role: "user",
          content: [
            { type: "input_text", text: "Extract wines into an array with fields: name, producer, region, country, grape, vintage, price, currency, byGlassOrBottle, section, rawText." },
            { type: "input_image", image_url: { /* ...buffer encoded... */ } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const json = /* TODO: parse model response to get WineItem[] */ (result as unknown as { wines: unknown[] });
    const wines = (Array.isArray(json.wines) ? json.wines : []) as Record<string, unknown>[];

    // create list row
    const { data: list, error: listError } = await supabaseServer
      .from("parsed_wine_lists")
      .insert([
        {
          user_id: userId,
          restaurant_name: restaurantName,
          source_type: "image"
        }
      ])
      .select()
      .single();

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    // insert items
    const rows = wines.map((w) => ({
      list_id: list.id,
      name: typeof w.name === "string" ? w.name : null,
      producer: typeof w.producer === "string" ? w.producer : null,
      region: typeof w.region === "string" ? w.region : null,
      country: typeof w.country === "string" ? w.country : null,
      grape: typeof w.grape === "string" ? w.grape : null,
      vintage: typeof w.vintage === "string" ? w.vintage : null,
      price: typeof w.price === "number" ? w.price : null,
      currency: typeof w.currency === "string" ? w.currency : null,
      by_glass_or_bottle: typeof w.byGlassOrBottle === "string" ? w.byGlassOrBottle : null,
      section: typeof w.section === "string" ? w.section : null,
      raw_text: typeof w.rawText === "string" ? w.rawText : null
    }));

    const { error: itemsError } = await supabaseServer
      .from("parsed_wine_items")
      .insert(rows);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ listId: list.id, count: rows.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    const status = message.startsWith("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
