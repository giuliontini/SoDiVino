import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { WineItem } from "@/lib/wineTypes";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

type FilePathOrBuffer = string | Buffer | { buffer: Buffer; mimeType?: string };

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

class OpenAIQuotaError extends Error {
  constructor(message = "LLM quota exceeded") {
    super(message);
    this.name = "OpenAIQuotaError";
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

const SYSTEM_PROMPT = `You are a master sommelier and structured data extraction assistant.
Given a restaurant wine menu image you must return JSON describing every unique wine line item you can read.
Use the following WineItem fields: name, producer, region, country, grape, vintage, price, currency, byGlassOrBottle ("glass", "bottle", "both", or "unknown"), section, rawText.
rawText must contain the exact string (or closest snippet) from the menu for traceability.
Only include the information that is explicitly visible. If details are missing set that field to null.
For prices set price as a number (no currency symbols) and currency as ISO code when obvious (USD/EUR/etc).
Every wine must include all schema fields; when a value is unknown set it to null.`;

const FEW_SHOT_MENU = `BY THE GLASS
NV PERRIER-JOUËT "GRAND BRUT" CHAMPAGNE $28
2021 TERLATO PINOT GRIGIO FRIULI 16 / 64
2018 CLOS DE LOS SIETE MALBEC BLEND MENDOZA 15
Bottle List - Reds
2019 DOMAINE LAPORTE SANCERRE "LES GRANDMONTAINS" 92
2017 TENUTA DI ARCENO CHIANTI CLASSICO RISERVA $74`;

const FEW_SHOT_JSON = JSON.stringify(
  {
    wines: [
      {
        name: "Grand Brut",
        producer: "Perrier-Jouët",
        region: "Champagne",
        country: "France",
        vintage: "NV",
        price: 28,
        currency: "USD",
        byGlassOrBottle: "glass",
        section: "By the Glass",
        rawText: 'NV PERRIER-JOUËT "GRAND BRUT" CHAMPAGNE $28',
      },
      {
        name: "Pinot Grigio",
        producer: "Terlato",
        region: "Friuli",
        vintage: "2021",
        price: 16,
        currency: "USD",
        byGlassOrBottle: "both",
        section: "By the Glass",
        rawText: "2021 TERLATO PINOT GRIGIO FRIULI 16 / 64",
      },
      {
        name: "Clos de los Siete",
        producer: "Clos de los Siete",
        grape: "Malbec Blend",
        region: "Mendoza",
        country: "Argentina",
        vintage: "2018",
        price: 15,
        currency: "USD",
        byGlassOrBottle: "glass",
        section: "By the Glass",
        rawText: "2018 CLOS DE LOS SIETE MALBEC BLEND MENDOZA 15",
      },
      {
        name: "Sancerre Les Grandmontains",
        producer: "Domaine Laporte",
        region: "Sancerre",
        country: "France",
        vintage: "2019",
        price: 92,
        currency: "USD",
        byGlassOrBottle: "bottle",
        section: "Bottle List - Reds",
        rawText: '2019 DOMAINE LAPORTE SANCERRE "LES GRANDMONTAINS" 92',
      },
      {
        name: "Chianti Classico Riserva",
        producer: "Tenuta di Arceno",
        region: "Chianti Classico",
        country: "Italy",
        vintage: "2017",
        price: 74,
        currency: "USD",
        byGlassOrBottle: "bottle",
        section: "Bottle List - Reds",
        rawText: "2017 TENUTA DI ARCENO CHIANTI CLASSICO RISERVA $74",
      },
    ],
  },
  null,
  2,
);

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    wines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "producer",
          "region",
          "country",
          "grape",
          "vintage",
          "price",
          "currency",
          "byGlassOrBottle",
          "section",
          "rawText",
        ],
        properties: {
          name: { type: "string" },
          producer: { type: ["string", "null"] },
          region: { type: ["string", "null"] },
          country: { type: ["string", "null"] },
          grape: { type: ["string", "null"] },
          vintage: { type: ["string", "null"] },
          price: { type: ["number", "null"] },
          currency: { type: ["string", "null"] },
          byGlassOrBottle: {
            type: ["string", "null"],
            enum: ["glass", "bottle", "both", "unknown", null],
          },
          section: { type: ["string", "null"] },
          rawText: { type: "string" },
        },
      },
    },
  },
  required: ["wines"],
} as const;

export async function POST(req: NextRequest) {
  try {
    await getUserId();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new BadRequestError("No image provided");
    }

    const mimeType = file.type || "";
    if (!mimeType || !mimeType.startsWith("image/")) {
      throw new BadRequestError("Uploaded file must be an image");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wines = await extractWineItemsFromImage({ buffer, mimeType });

    return NextResponse.json({ wines });
  } catch (error) {
    console.error("parse-menu-image error", error);
    if ((error as Error)?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (error instanceof BadRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof OpenAIQuotaError) {
      return NextResponse.json(
        { error: "Wine menu parsing is temporarily unavailable because the AI quota was exceeded. Please try again soon." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "Failed to parse wine menu image" }, { status: 500 });
  }
}

export async function extractWineItemsFromImage(
  filePathOrBuffer: FilePathOrBuffer
): Promise<WineItem[]> {
  const { base64, mimeType } = await encodeImageInput(filePathOrBuffer);
  const imageUrl = `data:${mimeType};base64,${base64}`;

  let response;
  try {
    response = await openai.responses.create({
      model: "gpt-4.1-mini",
      text: {
        format: {
          type: "json_schema",
          name: "wine_items",
          schema: RESPONSE_SCHEMA,
          strict: true,
        },
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: SYSTEM_PROMPT,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "You will be given a photo of a restaurant menu.",
                'Return ONLY valid JSON with a root object { "wines": WineItem[] } using the schema above.',
                "Example messy menu text:",
                FEW_SHOT_MENU,
                "Ideal JSON output:",
                FEW_SHOT_JSON,
                "Now parse the attached photo.",
              ].join("\n\n"),
            },
            {
              type: "input_image",
              detail: "high",
              image_url: imageUrl,
            },
          ],
        },
      ],
    });
  } catch (error) {
    if (isQuotaError(error)) {
      throw new OpenAIQuotaError();
    }
    throw error;
  }

  if (!response.output_text) {
    throw new Error("Model returned no text output");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  const wines = parseWineItems(parsed);
  return wines;
}


async function encodeImageInput(input: FilePathOrBuffer): Promise<{ base64: string; mimeType: string }> {
  if (typeof input === "string") {
    const resolved = path.resolve(input);
    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mimeType = MIME_BY_EXTENSION[ext] ?? "application/octet-stream";
    return { base64: buffer.toString("base64"), mimeType };
  }

  if (Buffer.isBuffer(input)) {
    return { base64: input.toString("base64"), mimeType: "application/octet-stream" };
  }

  return {
    base64: input.buffer.toString("base64"),
    mimeType: input.mimeType ?? "application/octet-stream",
  };
}

function parseWineItems(payload: unknown): WineItem[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as { wines?: unknown }).wines)
  ) {
    return [];
  }

  const wines = (payload as { wines: unknown[] }).wines;
  const result: WineItem[] = [];

  for (const maybeItem of wines) {
    const parsed = coerceWineItem(maybeItem);
    if (parsed) {
      result.push(parsed);
    }
  }

  return result;
}

function coerceWineItem(value: unknown): WineItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const name = coerceString(item.name);
  const rawText = coerceString(item.rawText) || name;

  if (!name || !rawText) {
    return null;
  }

  const id = coerceString(item.id) || randomUUID();
  const wine: WineItem = { id, name, rawText };

  assignIfPresent(wine, "producer", coerceString(item.producer));
  assignIfPresent(wine, "region", coerceString(item.region));
  assignIfPresent(wine, "country", coerceString(item.country));
  assignIfPresent(wine, "grape", coerceString(item.grape));
  assignIfPresent(wine, "vintage", coerceString(item.vintage));
  assignIfPresent(wine, "currency", coerceString(item.currency));
  assignIfPresent(wine, "section", coerceString(item.section));

  const price = coerceNumber(item.price);
  if (typeof price === "number") {
    wine.price = price;
  }

  const byGlass = coerceByGlass(item.byGlassOrBottle);
  if (byGlass) {
    wine.byGlassOrBottle = byGlass;
  }

  return wine;
}

function coerceString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
}

function coerceNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const match = value.match(/-?\d+(?:[.,]\d+)?/);
    if (!match) {
      return undefined;
    }
    const parsed = Number.parseFloat(match[0].replace(",", "."));
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function coerceByGlass(value: unknown): WineItem["byGlassOrBottle"] | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "glass" || normalized === "bottle" || normalized === "both" || normalized === "unknown") {
    return normalized;
  }

  return undefined;
}

function assignIfPresent<T, K extends keyof T>(target: T, key: K, value: T[K] | undefined) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function isQuotaError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError && error.status === 429) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const status = (error as { status?: number }).status;
  if (status === 429) {
    return true;
  }

  const code =
    (error as { code?: string }).code ||
    (error as { error?: { code?: string } }).error?.code ||
    (error as { response?: { data?: { error?: { code?: string } } } }).response?.data?.error?.code;

  return code === "insufficient_quota";
}
