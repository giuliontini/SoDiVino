// app/api/recommend-from-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { getWineProfileById } from "@/lib/preferences";
import { parseWinesFromText, scoreWine } from "@/lib/wine-agent";

export const runtime = "nodejs";   // important: Tesseract needs Node, not edge
export const maxDuration = 60;     // give OCR some time on Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const profileId = String(formData.get("profileId") || "");
    const budgetStr = formData.get("budget") as string | null;
    const dislikesStr = (formData.get("dislikes") as string | null) || "";
    const adventurousStr = (formData.get("adventurous") as string | null) || "3";

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const profile = getWineProfileById(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Unknown profileId" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. OCR
    const { data } = await Tesseract.recognize(buffer, "eng", {
      logger: () => {}, // you can log progress if you want
    });
    const text = data.text || "";

    // 2. Parse wines
    const wines = parseWinesFromText(text);
    if (wines.length === 0) {
      return NextResponse.json({
        wines: [],
        textPreview: text.slice(0, 400),
        message: "OCR worked but no wines were parsed. Adjust parsing logic for this menu format.",
      });
    }

    // 3. Score
    const explicitBudget = budgetStr ? Number(budgetStr) : null;
    const dislikes = dislikesStr
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);
    const adventurous = Number(adventurousStr) || 3;

    const scored = wines.map((w) =>
      scoreWine(w, profile, {
        budget: explicitBudget ?? profile.budget,
        dislikes,
        adventurous,
      }),
    );

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 3);

    return NextResponse.json({
      profile,
      parsedCount: wines.length,
      top,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error", details: err?.message || String(err) },
      { status: 500 },
    );
  }
}
