// app/api/preferences/route.ts
import { NextResponse } from "next/server";
import { getWineProfiles } from "@/lib/preferences";

export const runtime = "nodejs";

export async function GET() {
  const profiles = getWineProfiles();
  return NextResponse.json(profiles);
}
