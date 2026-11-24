import { NextRequest, NextResponse } from "next/server";
import { readPaymentProof } from "@/lib/payment-proof-storage";

// Auth is enforced by proxy.ts for every /api/admin/* path — no separate
// check needed here.
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const buffer = await readPaymentProof(key);
  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = key.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "pdf" ? "application/pdf" : "image/jpeg";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
