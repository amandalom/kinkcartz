import { NextResponse } from "next/server";

// TEMPORARY diagnostic route — not wired into any feature. Delete once the
// Netlify Blobs 500 is root-caused.
export async function GET() {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("debug-test");
    await store.set("ping", "pong");
    const value = await store.get("ping");
    const candidateVars = [
      "NETLIFY",
      "NETLIFY_DEV",
      "CONTEXT",
      "SITE_ID",
      "SITE_NAME",
      "DEPLOY_ID",
      "DEPLOY_URL",
      "URL",
      "AWS_LAMBDA_FUNCTION_NAME",
      "NETLIFY_BLOBS_CONTEXT",
      "NODE_ENV",
    ];
    const env: Record<string, string | null> = {};
    for (const k of candidateVars) env[k] = process.env[k] ?? null;
    return NextResponse.json({ ok: true, value, env });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        netlifyEnv: process.env.NETLIFY ?? null,
      },
      { status: 500 }
    );
  }
}
