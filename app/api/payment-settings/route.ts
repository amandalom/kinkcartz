import { NextResponse } from "next/server";
import { getPublicPaymentOptions } from "@/lib/payment-settings";

// Public: checkout needs this before an order exists. Only exposes what's
// safe to show immediately (enabled methods + the Bitcoin address) — other
// methods' handles stay server-side until the post-checkout magic link.
export async function GET() {
  const options = await getPublicPaymentOptions();
  return NextResponse.json({ options });
}
