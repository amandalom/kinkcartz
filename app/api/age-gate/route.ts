import { NextRequest, NextResponse } from "next/server";

// Sets a short-lived, session-scoped confirmation that the visitor
// self-attested to being of legal age. This is NOT identity age
// verification — see README for what real compliance requires in
// jurisdictions with age-verification statutes (e.g. Louisiana, Texas,
// Utah, Virginia and others as of 2026).
export async function POST(req: NextRequest) {
  const { next } = await req.json().catch(() => ({ next: "/" }));
  const res = NextResponse.json({ ok: true });
  res.cookies.set("age_verified", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24h re-confirmation
    path: "/",
  });
  return res;
}
