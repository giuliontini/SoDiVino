import { NextRequest } from "next/server";

export function getUserIdFromRequest(req: NextRequest): string | null {
  const fromHeader = req.headers.get("x-user-id")?.trim();
  if (fromHeader) return fromHeader;

  const fromEnv = process.env.DEMO_USER_ID?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : null;
}

export function requireUserId(req: NextRequest): string {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new Error("Unauthorized: missing user id");
  }
  return userId;
}
