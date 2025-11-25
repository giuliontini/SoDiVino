import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const userId = /* TODO: auth */;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const restaurantName = formData.get("restaurantName") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Call OpenAI vision (pseudo-code, depends on client version)
  const result = await openai.responses.create({
    model: "gpt-4.1-mini", // or vision-capable model
    input: [
      {
        role: "system",
        content:
          "You are a sommelier assistant. Extract a structured list of wines from this restaurant menu image. Return JSON only.",
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

  const json = /* TODO: parse model response to get WineItem[] */;
  const wines = json.wines as any[];

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
    name: w.name,
    producer: w.producer,
    region: w.region,
    country: w.country,
    grape: w.grape,
    vintage: w.vintage,
    price: w.price,
    currency: w.currency,
    by_glass_or_bottle: w.byGlassOrBottle,
    section: w.section,
    raw_text: w.rawText
  }));

  const { error: itemsError } = await supabaseServer
    .from("parsed_wine_items")
    .insert(rows);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ listId: list.id, count: rows.length });
}
